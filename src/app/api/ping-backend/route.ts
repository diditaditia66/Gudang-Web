import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.BACKEND_BASE;
  if (!base) return NextResponse.json({ ok:false, reason:"BACKEND_BASE missing" }, { status: 500 });

  try {
    const r = await fetch(`${base.replace(/\/+$/, "")}/health`, { cache: "no-store", signal: (AbortSignal as any).timeout?.(5000) });
    const text = await r.text();
    return NextResponse.json({ ok:true, backendStatus:r.status, body:text.slice(0,200) });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || String(e) }, { status: 500 });
  }
}
