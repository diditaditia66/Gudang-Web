// src/app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = (process.env.BACKEND_BASE || "").replace(/\/+$/, "");

function ensureBase() {
  if (!BASE) {
    return NextResponse.json(
      { message: "BACKEND_BASE is not set" },
      { status: 500 }
    );
  }
  return null;
}

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
  "cookie",
]);

async function proxy(req: NextRequest, params: { path: string[] }) {
  const baseError = ensureBase();
  if (baseError) return baseError;

  const session = await auth().catch(() => null); // opsional, jangan gagalkan bila auth error

  // Build target URL
  const urlPath = "/" + (params.path?.join("/") ?? "");
  const search = req.nextUrl.search || "";
  const targetUrl = BASE + urlPath + search;

  // Copy headers (minus hop-by-hop + cookie)
  const headers = new Headers();
  req.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) headers.set(k, v);
  });

  // Tambahkan identitas (jika ada)
  const who =
    (session?.user?.email as string) ||
    (session?.user?.name as string) ||
    undefined;
  if (who) headers.set("x-user-email", who);

  // Method & body
  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  // Forward request
  const resp = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  // Salin response headers (hindari set-cookie)
  const out = new Headers();
  resp.headers.forEach((v, k) => {
    if (k.toLowerCase() !== "set-cookie") out.set(k, v);
  });

  return new NextResponse(resp.body, { status: resp.status, headers: out });
}

// OPTIONS (preflight) – langsung teruskan ke backend, atau balas 204 jika BASE kosong
export async function OPTIONS(req: NextRequest, ctx: { params: { path: string[] } }) {
  if (!BASE) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }
  return proxy(req, ctx.params);
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
