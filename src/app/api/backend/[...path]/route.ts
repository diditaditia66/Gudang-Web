// src/app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // agar tidak di-cache oleh Amplify
export const runtime = "nodejs"; // wajib: gunakan Node runtime, bukan Edge

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
type M = (typeof METHODS)[number];

// ---- fungsi util: retry ringan dengan backoff ----
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

// ---- handler utama ----
async function handle(req: NextRequest, { params }: { params: { path: string[] } }) {
  const base = process.env.BACKEND_BASE;
  if (!base) {
    return NextResponse.json({ error: "BACKEND_BASE is not set on server" }, { status: 500 });
  }

  const path = params.path.join("/");
  const url = new URL(req.url);
  const qs = url.search || "";
  const dest = `${base.replace(/\/+$/, "")}/${path}${qs}`;

  // forward token JWT dari cookie -> Authorization Bearer
  const token = req.cookies.get("token")?.value;

  // headers untuk request ke backend
  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
    "Accept": req.headers.get("accept") ?? "application/json, */*;q=0.1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Next.js Server Chrome Safari",
    "X-Forwarded-Proto": "https",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // rakit opsi fetch
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000); // 7 detik batas
  const init: RequestInit = {
    method: req.method,
    headers,
    signal: controller.signal,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text(); // ambil body mentah
  }

  try {
    const r = await withRetry(() => fetch(dest, init));
    clearTimeout(timeout);

    const text = await r.text();
    try {
      const json = text ? JSON.parse(text) : null;
      return NextResponse.json(json, { status: r.status });
    } catch {
      // fallback ke text biasa
      return new NextResponse(text, {
        status: r.status,
        headers: { "Content-Type": r.headers.get("content-type") ?? "text/plain" },
      });
    }
  } catch (err: any) {
    const msg = typeof err?.message === "string" ? err.message : String(err);
    return NextResponse.json(
      { error: "Proxy failed", detail: msg },
      { status: 500 }
    );
  }
}

// ---- ekspor handler untuk semua metode HTTP ----
export const GET = (req: NextRequest, ctx: any) => handle(req, ctx);
export const POST = (req: NextRequest, ctx: any) => handle(req, ctx);
export const PUT = (req: NextRequest, ctx: any) => handle(req, ctx);
export const PATCH = (req: NextRequest, ctx: any) => handle(req, ctx);
export const DELETE = (req: NextRequest, ctx: any) => handle(req, ctx);
