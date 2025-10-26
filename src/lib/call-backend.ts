"use client";
import { getIdToken } from "./auth-client";

export async function callBackend(path: string, init?: RequestInit) {
  const idToken = await getIdToken();
  return fetch(path, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}
