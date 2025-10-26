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
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i === times) break;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
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

  // ✅ SALIN semua header masuk (termasuk Authorization) ke header keluar
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    // buang header yang bermasalah untuk proxy
    if (k === "host" || k === "content-length" || k === "connection") return;
    headers.set(key, value);
  });

  // pastikan Content-Type ada untuk request ber-body
  if (!headers.has("content-type") && req.method !== "GET" && req.method !== "HEAD") {
    headers.set("content-type", "application/json");
  }
  // tambahkan header info proxy jika mau
  headers.set("X-Forwarded-Proto", "https");
  headers.set("User-Agent", "Next.js Server (Proxy)");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

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

    // Teruskan response dari backend apa adanya (content-type, dll.)
    const bodyBuf = await r.arrayBuffer();
    const out = new NextResponse(bodyBuf, { status: r.status });
    r.headers.forEach((v, k) => {
      // optional: filter header tertentu jika perlu
      out.headers.set(k, v);
    });
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
