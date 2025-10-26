// src/app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BACKEND_BASE || "https://gudang.didit-aditia.my.id"));
  res.cookies.set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
  return res;
}
