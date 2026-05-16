import { db, TestCasesTable } from "@/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, title, description, targetRoute, expectedResult } = body;

  const testCase = await db
    .update(TestCasesTable)
    .set({
      title,
      description,
      targetRoute,
      expectedResult,
    })
    .where(eq(TestCasesTable.id, id))
    .returning();

  return NextResponse.json(testCase[0]);
}
