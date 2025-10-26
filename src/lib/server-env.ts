// src/lib/server-env.ts
export function getServerEnv() {
  const BACKEND_BASE = (process.env.BACKEND_BASE || "").trim();
  const BACKEND_BEARER = (process.env.BACKEND_BEARER || "").trim();

  if (!BACKEND_BASE) {
    throw new Error("BACKEND_BASE is missing on server runtime");
  }
  if (!BACKEND_BEARER) {
    throw new Error("BACKEND_BEARER is missing on server runtime");
  }
  return { BACKEND_BASE, BACKEND_BEARER };
}
