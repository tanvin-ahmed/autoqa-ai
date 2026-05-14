import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

type ClerkUser = NonNullable<Awaited<ReturnType<typeof currentUser>>>;

function clerkEmail(user: ClerkUser) {
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    ""
  );
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

  try {
    const userList = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userList.length > 0) {
      const existing = userList[0];
      if (name && existing.name !== name) {
        const [updated] = await db
          .update(users)
          .set({ name })
          .where(eq(users.email, email))
          .returning();
        return NextResponse.json({ user: updated ?? existing });
      }
      return NextResponse.json({ user: existing });
    }

    const newUser = await db
      .insert(users)
      .values({
        email,
        name: name || null,
      })
      .returning();

    return NextResponse.json({ user: newUser[0] }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
