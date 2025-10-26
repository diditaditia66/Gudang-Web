"use client";
import { fetchAuthSession } from "aws-amplify/auth";

/**
 * Panggil backend melalui proxy Next: /api/backend/...
 * Akan otomatis menambahkan Authorization: Bearer <idToken>.
 */
export async function callBackend(path: string, init?: RequestInit) {
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString(); // pakai idToken; ganti ke accessToken jika backend memverifikasi access token

  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (idToken) headers.set("Authorization", `Bearer ${idToken}`);

  return fetch(path, { ...init, headers, cache: "no-store" });
}
