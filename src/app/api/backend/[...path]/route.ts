// src/app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/server-env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  let BACKEND_BASE: string, BACKEND_BEARER: string;
  try {
    ({ BACKEND_BASE, BACKEND_BEARER } = getServerEnv());
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Server env missing" }, { status: 401 });
  }

  const path = params.path.join("/");
  const url = new URL(req.url);
  const dest = `${BACKEND_BASE.replace(/\/+$/, "")}/${path}${url.search || ""}`;

  const headers = new Headers();
  req.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (key === "host" || key === "content-length" || key === "connection") return;
    headers.set(k, v);
  });

  // pakai service bearer
  headers.set("authorization", `Bearer ${BACKEND_BEARER}`);
  if (!headers.has("content-type") && req.method !== "GET" && req.method !== "HEAD") {
    headers.set("content-type", "application/json");
  }
  headers.set("x-forwarded-proto", "https");
  headers.set("user-agent", "Next.js Server (Proxy)");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const init: RequestInit = {
    method: req.method,
    headers,
    signal: controller.signal,
    cache: "no-store",
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
  };

  try {
    const r = await withRetry(() => fetch(dest, init));
    clearTimeout(timeout);

    const buf = await r.arrayBuffer();
    const out = new NextResponse(buf, { status: r.status });
    r.headers.forEach((v, k) => out.headers.set(k, v));
    return out;
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
