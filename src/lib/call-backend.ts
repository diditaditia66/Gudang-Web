// src/lib/call-backend.ts

const RUNTIME_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");

function isNextApi(path: string) {
  return path.startsWith("/api/");
}

function buildUrl(path: string) {
  if (isNextApi(path)) return path; // lewat proxy Next (same-origin)

  if (!RUNTIME_BASE) {
    throw new Error(
      `NEXT_PUBLIC_API_BASE_URL belum di-set, tidak bisa memanggil path eksternal: ${path}`
    );
  }

  // gabungkan base + path (pastikan 1 slash)
  return `${RUNTIME_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Panggil backend. 
 * - Jika `path` diawali "/api/", request akan ke origin (proxy Next).
 * - Jika tidak, request diarahkan ke NEXT_PUBLIC_API_BASE_URL.
 */
export function callBackend(path: string, init: RequestInit = {}) {
  const url = buildUrl(path);

  const headers = new Headers(init.headers || {});
  // terima JSON secara default
  if (!headers.has("accept")) headers.set("accept", "application/json");

  // set content-type bila ada body dan belum ada headernya
  const hasBody = init.body != null;
  if (hasBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const opts: RequestInit = {
    ...init,
    headers,
    cache: "no-store",
    // cookie NextAuth tetap terkirim untuk same-origin (/api/...)
    credentials: "same-origin",
  };

  return fetch(url, opts);
}

/** Helper kecil kalau butuh langsung JSON */
export async function callBackendJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await callBackend(path, init);
  if (!res.ok) {
    // coba ambil pesan error dari backend
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch {
      // ignore parse error
    }
    throw new Error(msg);
  }
  // jika 204/empty, balikan null agar aman
  if (res.status === 204) return null as unknown as T;
  return (await res.json()) as T;
}
