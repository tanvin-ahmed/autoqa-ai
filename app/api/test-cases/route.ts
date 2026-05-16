import { db } from "@/db";
import { TestCasesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get("repoId");

  if (!repoId) {
    return NextResponse.json({ error: "Repo ID is required" }, { status: 400 });
  }

  const testCases = await db
    .select()
    .from(TestCasesTable)
    .where(eq(TestCasesTable.repoId, repoId));

  return NextResponse.json(testCases);
}
