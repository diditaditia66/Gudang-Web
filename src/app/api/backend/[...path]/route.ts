// src/app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = (process.env.BACKEND_BASE || "").replace(/\/+$/, "");

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
  // NOTE: jangan kirim cookie ke backend eksternal
  "cookie",
]);

async function proxy(req: NextRequest, params: { path: string[] }) {
  if (!BASE) {
    return NextResponse.json({ message: "BACKEND_BASE is not set" }, { status: 500 });
  }

  // ambil sesi kalau ada (jangan fail kalau error)
  const session = await auth().catch(() => null);

  // build target URL
  const path = "/" + (params.path?.join("/") ?? "");
  const targetUrl = BASE + path + (req.nextUrl.search || "");

  // copy headers (minus hop-by-hop)
  const headers = new Headers();
  req.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) headers.set(k, v);
  });

  // tambahkan identitas jika ada
  const who = (session?.user?.email as string) || (session?.user?.name as string) || undefined;
  if (who) headers.set("x-user-email", who);

  // normalisasi method & body
  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  let body: ArrayBuffer | undefined = undefined;

  if (hasBody) {
    body = await req.arrayBuffer();

    // pastikan Content-Type ada saat body dipakai
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
  }

  // beberapa platform/edge suka melucuti body di DELETE
  // trik: kalau DELETE + ada body, set method override
  if (method === "DELETE" && body && !headers.has("x-http-method-override")) {
    headers.set("x-http-method-override", "DELETE");
  }

  const resp = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  // salin response headers (tanpa set-cookie)
  const out = new Headers();
  resp.headers.forEach((v, k) => {
    if (k.toLowerCase() !== "set-cookie") out.set(k, v);
  });

  return new NextResponse(resp.body, { status: resp.status, headers: out });
}

// preflight
export async function OPTIONS(_req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params);
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params);
}
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params);
}
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params);
}
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params);
}
