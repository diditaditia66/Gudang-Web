"use client";
import { getSession } from "next-auth/react";

export async function getUserEmail(): Promise<string | null> {
  const s = await getSession();
  return (s?.user?.email as string) || (s?.user?.name as string) || null;
}
