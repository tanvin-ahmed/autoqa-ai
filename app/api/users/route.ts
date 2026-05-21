import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db, users } from "@/db";
import type { User } from "@/db/schema";

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

function clerkEmail(user: ClerkUser) {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  )
    .trim()
    .toLowerCase();
}

function clerkDisplayName(user: ClerkUser): string {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  const fromParts = parts.join(" ").trim();
  return (
    user.fullName?.trim() ||
    fromParts ||
    user.username?.trim() ||
    ""
  );
}

/** Postgres error code `23505` = unique_violation (e.g. concurrent user registration). */
function pgErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return undefined;
}

export async function POST() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = clerkEmail(user);
  if (!email) {
    return NextResponse.json(
      { error: "No email address on Clerk user" },
      { status: 400 },
    );
  }

  const name = clerkDisplayName(user);
  const whereEmail = sql`LOWER(TRIM(${users.email})) = ${email}`;

  async function maybeRefreshName(existing: User): Promise<User> {
    if (name && existing.name !== name) {
      const [updated] = await db
        .update(users)
        .set({ name })
        .where(whereEmail)
        .returning();
      return updated ?? existing;
    }
    return existing;
  }

  try {
    const [existingRow] = await db
      .select()
      .from(users)
      .where(whereEmail)
      .limit(1);

    if (existingRow) {
      const row = await maybeRefreshName(existingRow);
      return NextResponse.json({ user: row });
    }

    try {
      const [inserted] = await db
        .insert(users)
        .values({
          email,
          name: name || null,
        })
        .returning();

      return NextResponse.json({ user: inserted }, { status: 201 });
    } catch (insertErr: unknown) {
      /* Two clients (e.g. Provider + workspace) can INSERT the same email at once. */
      if (pgErrorCode(insertErr) !== "23505") {
        throw insertErr;
      }
      const [raced] = await db
        .select()
        .from(users)
        .where(whereEmail)
        .limit(1);

      if (!raced) {
        throw insertErr;
      }

      const row = await maybeRefreshName(raced);
      return NextResponse.json({ user: row });
    }
  } catch (error: unknown) {
    console.error("[POST /api/users]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
