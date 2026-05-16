import { db, repositories } from "@/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const { id, targetDomain, globalInstruction } = await request.json();

  if (!id) {
    return NextResponse.json(
      { error: "Repository ID is required" },
      { status: 400 },
    );
  }

  const updatedRepo = await db
    .update(repositories)
    .set({
      targetDomain,
      globalInstruction,
    })
    .where(eq(repositories.id, id))
    .returning();

  return NextResponse.json(updatedRepo[0]);
}
