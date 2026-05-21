import { currentUser } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { users, type User } from "@/db/schema";

export type AuthenticatedDbUser = { user: User };

export type AuthenticatedDbUserError = {
  error: string;
  status: number;
};

/**
 * Clerk session → Neon `users` row (matched by primary email).
 * Rows are created via `POST /api/users` when the workspace loads with Clerk configured.
 */
export async function getAuthenticatedDbUser(): Promise<
  AuthenticatedDbUser | AuthenticatedDbUserError
> {
  const cu = await currentUser();
  if (!cu) {
    return { error: "Unauthorized", status: 401 };
  }

  const email =
    cu.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ??
    cu.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase();

  if (!email) {
    return { error: "No email address on Clerk user", status: 400 };
  }

  const [row] = await db
    .select()
    .from(users)
    .where(sql`LOWER(TRIM(${users.email})) = ${email}`)
    .limit(1);

  if (!row) {
    return {
      error: "Account not initialized. Reload the workspace to sync your profile.",
      status: 403,
    };
  }

  return { user: row };
}
