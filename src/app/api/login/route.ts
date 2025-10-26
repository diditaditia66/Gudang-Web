// src/app/api/login/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function pickBackendBase() {
  return (
    process.env.BACKEND_BASE?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_BASE?.trim() ||
    "https://api.cartenz-vpn.my.id"
  );
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ message: "Username & password wajib" }, { status: 400 });
    }

    const base = pickBackendBase();
    const r = await fetch(`${base.replace(/\/+$/, "")}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
      signal: (AbortSignal as any).timeout?.(7000),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return NextResponse.json(
        data?.message ? data : { message: `Login gagal (backend ${r.status})` },
        { status: r.status }
      );
    }

    const token: string = data.token;
    const u: string = data.user?.username ?? username;
    const res = NextResponse.json({ ok: true, user: { username: u } });

    res.cookies.set("token", token, {
      httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 8,
    });
    res.cookies.set("u", u, {
      httpOnly: false, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 8,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
