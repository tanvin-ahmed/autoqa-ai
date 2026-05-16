import { NextRequest, NextResponse } from "next/server";
import { db, repositories } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await db
    .insert(repositories)
    .values({
      repoId: body.id,
      userId: body.userId,
      name: body.name,
      fullName: body.fullName,
      private: body.private,
      htmlUrl: body.htmlUrl,
      defaultBranch: body.defaultBranch,
      owner: body.owner,
      description: body.description,
      language: body.language,
    })
    .returning();

  return NextResponse.json(result[0]);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(repositories)
    .where(eq(repositories.userId, parseInt(userId)));

  if (result.length === 0) {
    return NextResponse.json(
      { error: "No repositories found" },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
