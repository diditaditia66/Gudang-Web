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
  "cookie", // jangan teruskan cookie ke backend eksternal
]);

async function proxy(req: NextRequest, params: { path: string[] }) {
  if (!BASE) {
    return NextResponse.json({ message: "BACKEND_BASE is not set" }, { status: 500 });
  }

  // Ambil sesi kalau ada (jangan memblokir)
  const session = await auth().catch(() => null);

  const path = "/" + (params.path?.join("/") ?? "");
  const targetUrl = BASE + path + (req.nextUrl.search || "");

  // Copy headers request (minus hop-by-hop)
  const headers = new Headers();
  req.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) headers.set(k, v);
  });

  // Identitas user (opsional)
  const who = (session?.user?.email as string) || (session?.user?.name as string) || undefined;
  if (who) headers.set("x-user-email", who);

  // Method & body
  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  let body: ArrayBuffer | undefined = undefined;

  if (hasBody) {
    body = await req.arrayBuffer();
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
  }

  // Beberapa edge melucuti body DELETE — pakai override agar aman
  if (method === "DELETE" && body && !headers.has("x-http-method-override")) {
    headers.set("x-http-method-override", "DELETE");
  }

  // Panggil backend
  const resp = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  // BUFFER body supaya tidak streaming/gzip transparan
  const respBuf = await resp.arrayBuffer();

  // Salin header response tapi bersihkan encoding/length
  const out = new Headers();
  resp.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (key === "set-cookie") return;
    if (key === "content-encoding") return;
    if (key === "transfer-encoding") return;
    if (key === "content-length") return;
    out.set(k, v);
  });

  // Pastikan content-type JSON terlihat oleh DevTools
  if (!out.has("content-type")) {
    out.set("content-type", "application/json; charset=utf-8");
  }
  // Hindari cache
  out.set("cache-control", "no-store");

  return new NextResponse(respBuf, { status: resp.status, headers: out });
}

export async function OPTIONS() {
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
