// Selalu kirim ke proxy Next.js bila path sudah diawali dengan /api/
// Hanya pakai NEXT_PUBLIC_API_BASE_URL untuk path backend "langsung" (tanpa /api/)
const RUNTIME_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/,"");

export function callBackend(path: string, init: RequestInit = {}) {
  // Kalau sudah /api/... -> biarkan tetap relative ke origin (Next.js)
  // Contoh: /api/backend/get_barang
  const isNextApi = path.startsWith("/api/");

  const url = isNextApi
    ? path
    : `${RUNTIME_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers || {});
  // Set Content-Type JSON jika ada body tapi belum ada headernya
  if (!headers.has("content-type") && init.body) {
    headers.set("content-type", "application/json");
  }

  // Jangan cache (biar data live)
  const opts: RequestInit = {
    ...init,
    headers,
    cache: "no-store",
    // Kirim kredensial (cookie NextAuth) ke origin yang sama (safe)
    credentials: "same-origin",
  };

  return fetch(url, opts);
}
