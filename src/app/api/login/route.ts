// src/app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ message: "Username & password wajib" }, { status: 400 });
    }

    const r = await fetch(`${process.env.BACKEND_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json(data, { status: r.status });
    }

    const token: string = data.token;
    const u: string = data.user?.username ?? username;

    const res = NextResponse.json({ ok: true, user: { username: u } });

    // HttpOnly token cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
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
  } catch (e) {
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
