// src/lib/call-backend.ts
const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/backend").replace(/\/+$/, "");

type Opt = RequestInit & { json?: unknown };

export async function callBackend(path: string, opt: Opt = {}) {
  const url =
    path.startsWith("http") ? path :
    path.startsWith("/api/backend") ? path :
    `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(opt.headers || {});
  // Jika akan mengirim body, pastikan JSON
  const willSendBody = opt.body != null || opt.json != null;
  if (willSendBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const body = opt.json != null
    ? JSON.stringify(opt.json)
    : (opt.body as BodyInit | null | undefined);

  const res = await fetch(url, {
    ...opt,
    headers,
    body,
    method: opt.method ?? (willSendBody ? "POST" : "GET"),
    // penting: kirim cookie NextAuth untuk lewati middleware
    credentials: "same-origin",
    // hindari stale cache di browser
    cache: "no-store",
  });

  return res;
}
