// src/lib/call-backend.ts
"use client";

export async function callBackend(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers || {});
  if (!headers.has("content-type") && typeof opts.body === "string") {
    headers.set("content-type", "application/json");
  }
  return fetch(path, {
    ...opts,
    headers,
    cache: "no-store",
    credentials: "include",
  });
}
