"use client";
import { getCurrentUser, fetchAuthSession, signOut } from "aws-amplify/auth";

export async function getUserEmail(): Promise<string | null> {
  try {
    const u = await getCurrentUser();
    // username = email (sesuai konfigurasi)
    return (u?.username as string) ?? null;
  } catch { return null; }
}

export async function getIdToken(): Promise<string | null> {
  const { tokens } = await fetchAuthSession();
  return tokens?.idToken?.toString() ?? null;
}

export async function logoutAndGoLogin() {
  try { await signOut(); } finally { location.href = "/login"; }
}
