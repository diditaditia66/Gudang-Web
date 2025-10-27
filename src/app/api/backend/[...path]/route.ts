// src/app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const BASE = process.env.BACKEND_BASE!;

async function proxy(req: NextRequest, params: { path: string[] }) {
  const session = await getServerSession(authOptions);

  const urlPath = "/" + (params.path?.join("/") ?? "");
  const targetUrl = BASE + urlPath + (req.nextUrl.search || "");

  const headers = new Headers();
  req.headers.forEach((v, k) => {
    const lk = k.toLowerCase();
    if (["host", "connection", "content-length", "cookie"].includes(lk)) return;
    headers.set(k, v);
  });

  if (session?.user?.email || session?.user?.name) {
    headers.set("x-user-email", String(session.user?.email ?? session.user?.name));
  }

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const resp = await fetch(targetUrl, { method, headers, body, redirect: "manual" });

  const outHeaders = new Headers();
  resp.headers.forEach((v, k) => outHeaders.set(k, v));
  return new NextResponse(resp.body, { status: resp.status, headers: outHeaders });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}
export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params);
}
