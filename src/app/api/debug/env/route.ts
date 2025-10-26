// src/app/api/debug/env/route.ts
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const bearer = (process.env.BACKEND_BEARER || "").trim();
  const base = (process.env.BACKEND_BASE || "").trim();
  return NextResponse.json({
    BACKEND_BEARER_present: !!bearer,
    BACKEND_BEARER_head: bearer ? bearer.slice(0, 12) + "..." : null,
    BACKEND_BASE: base || null,
  });
}
