import { NextResponse } from "next/server";

export function errorResponse(status: number, error: string): NextResponse {
  return NextResponse.json({ error }, { status });
}
