// src/lib/user.ts
"use server";
import { cookies } from "next/headers";

export function getUsernameFromCookie() {
  const c = cookies().get("u")?.value;
  return c ?? "";
}
