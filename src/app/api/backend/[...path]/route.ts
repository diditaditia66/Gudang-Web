// src/app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE = process.env.BACKEND_BASE?.replace(/\/+$/, "") || "https://api.cartenz-vpn.my.id";

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
  const path = "/" + (params.path?.join("/") ?? "");
  const targetUrl = BASE + path + (req.nextUrl.search || "");

  const session = await auth().catch(() => null);

  const headers = new Headers();
  req.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) headers.set(k, v);
  });

  const who = (session?.user?.email as string) || (session?.user?.name as string) || undefined;
  if (who) headers.set("x-user-email", who);

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  if (hasBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  // Bypass masalah DELETE body di fetch
  if (method === "DELETE" && body) {
    headers.set("x-http-method-override", "DELETE");
  }

  const resp = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const out = new Headers();
  resp.headers.forEach((v, k) => {
    if (k.toLowerCase() !== "set-cookie") out.set(k, v);
  });

  return new NextResponse(resp.body, { status: resp.status, headers: out });
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
