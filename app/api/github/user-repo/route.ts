import { NextRequest, NextResponse } from "next/server";
import { db, repositories } from "@/db";

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
