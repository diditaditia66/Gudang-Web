import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "logged out" });
  res.cookies.set("token", "", { httpOnly: true, expires: new Date(0) });
  res.cookies.set("u", "", { httpOnly: false, expires: new Date(0) });
  return res;
}
