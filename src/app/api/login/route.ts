// src/app/api/login/route.ts
import { NextResponse } from "next/server";

// pastikan route ini berjalan di Node runtime & tidak di-cache
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ message: "Username & password wajib" }, { status: 400 });
    }

    const base = process.env.BACKEND_BASE;
    if (!base) {
      return NextResponse.json(
        { message: "BACKEND_BASE is not set on server" },
        { status: 500 }
      );
    }

    const r = await fetch(`${base.replace(/\/+$/, "")}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ username, password }),
      // jangan cache
      cache: "no-store",
      // batas waktu biar tidak menggantung lama
      signal: (AbortSignal as any).timeout?.(7000),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      // teruskan pesan dari backend kalau ada
      return NextResponse.json(
        data?.message ? data : { message: `Login gagal (backend ${r.status})` },
        { status: r.status }
      );
    }

    const token: string = data.token;
    const u: string = data.user?.username ?? username;

    const res = NextResponse.json({ ok: true, user: { username: u } });

    // HttpOnly token cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true, // wajib true di https
      path: "/",
      maxAge: 60 * 60 * 8, // 8 jam
    });

    // readable username cookie (non-HttpOnly)
    res.cookies.set("u", u, {
      httpOnly: false,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "Terjadi kesalahan server";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
