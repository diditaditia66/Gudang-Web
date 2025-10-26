// src/app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function pickBackendBase() {
  return (
    process.env.BACKEND_BASE?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_BASE?.trim() ||
    "https://api.cartenz-vpn.my.id"
  );
}

// retry helper
async function withRetry<T>(fn: () => Promise<T>, times = 2, delayMs = 400): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= times; i++) {
    try { return await fn(); } catch (err) {
      lastErr = err; if (i === times) break;
      await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

async function handle(req: NextRequest, { params }: { params: { path: string[] } }) {
  const base = pickBackendBase();

  const path = params.path.join("/");
  const url = new URL(req.url);
  const qs = url.search || "";
  const dest = `${base.replace(/\/+$/, "")}/${path}${qs}`;

  const token = req.cookies.get("token")?.value;

  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
    "Accept": req.headers.get("accept") ?? "application/json, */*;q=0.1",
    "User-Agent": "Next.js Server (Amplify)",
    "X-Forwarded-Proto": "https",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  const init: RequestInit = { method: req.method, headers, signal: controller.signal, cache: "no-store" };
  if (req.method !== "GET" && req.method !== "HEAD") init.body = await req.text();

  try {
    const r = await withRetry(() => fetch(dest, init));
    clearTimeout(timeout);

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
    const msg = typeof err?.message === "string" ? err.message : String(err);
    return NextResponse.json({ error: "Proxy failed", detail: msg }, { status: 500 });
  }
}

export const GET = (req: NextRequest, ctx: any) => handle(req, ctx);
export const POST = (req: NextRequest, ctx: any) => handle(req, ctx);
export const PUT = (req: NextRequest, ctx: any) => handle(req, ctx);
export const PATCH = (req: NextRequest, ctx: any) => handle(req, ctx);
export const DELETE = (req: NextRequest, ctx: any) => handle(req, ctx);
