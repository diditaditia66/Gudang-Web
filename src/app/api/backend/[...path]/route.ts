// src/app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // penting: gunakan Node runtime (bukan Edge)

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type M = (typeof METHODS)[number];

// ---- util: retry ringan dengan backoff ----
async function withRetry<T>(fn: () => Promise<T>, times = 2, delayMs = 400): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= times; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i === times) break;
      await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

async function handle(req: NextRequest, { params }: { params: { path: string[] } }) {
  const base = process.env.BACKEND_BASE;
  if (!base) {
    return NextResponse.json(
      { error: "BACKEND_BASE is not set on server" },
      { status: 500 }
    );
  }

  const path = params.path.join("/");
  const url = new URL(req.url);
  const qs = url.search || "";
  const dest = `${base.replace(/\/+$/, "")}/${path}${qs}`;

  // forward token dari cookie -> Authorization Bearer
  const token = req.cookies.get("token")?.value;

  // siapkan headers untuk melewati Cloudflare (UA ala browser) + forward content-type
  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Next.js Server Chrome Safari",
    "Accept": req.headers.get("accept") ?? "application/json, */*;q=0.1",
    "X-Forwarded-Proto": "https",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // rakit init; pakai timeout agar koneksi tidak menggantung
  const init: RequestInit = {
    method: req.method,
    headers,
    // Abort kalau > 7 detik
    signal: (AbortSignal as any).timeout?.(7000) ?? undefined,
    // cache none supaya POST/DELETE dsb tidak ke-cache
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    // penting: ambil body mentah agar transparan
    init.body = await req.text();
  }

  try {
    const r = await withRetry(() => fetch(dest, init));

    // teruskan status & body apa adanya (auto coba parse JSON)
    const text = await r.text();
    try {
      const json = text ? JSON.parse(text) : null;
      return NextResponse.json(json, { status: r.status });
    } catch {
      return new NextResponse(text, {
        status: r.status,
        headers: { "Content-Type": r.headers.get("content-type") ?? "text/plain" },
      });
    }
  } catch (err: any) {
    // tangani ECONNRESET, ETIMEDOUT, dll
    const msg = typeof err?.message === "string" ? err.message : String(err);
    return NextResponse.json(
      { error: "Proxy failed", detail: msg },
      { status: 500 }
    );
  }
}

export const GET = (req: NextRequest, ctx: any) => handle(req, ctx);
export const POST = (req: NextRequest, ctx: any) => handle(req, ctx);
export const PUT = (req: NextRequest, ctx: any) => handle(req, ctx);
export const PATCH = (req: NextRequest, ctx: any) => handle(req, ctx);
export const DELETE = (req: NextRequest, ctx: any) => handle(req, ctx);
