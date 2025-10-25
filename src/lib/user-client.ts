// src/lib/user-client.ts
// Helper client-side membaca cookie 'u' (username)
export function getUsername(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)u=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
