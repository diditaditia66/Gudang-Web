// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Prefix publik (assets dll)
const PUBLIC_PREFIXES = ["/_next"] as const;

// API publik (boleh tanpa token) → tambahkan /api/backend
const PUBLIC_API = [
  "/api/login",
  "/api/logout",
  "/api/ping-backend",
  "/api/backend",            // ✅ lewati proxy backend
] as const;

function isPublicPath(pathname: string) {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("token")?.value ?? null;

  // 1) Public path & API publik → lolos
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 2) Jika belum login (cookie token lama tidak ada)
  if (!token) {
    // a) Untuk request API non-publik → balas 401 JSON
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // b) Untuk halaman biasa → redirect ke /login?next=<path>
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // 3) Jika sudah login dan mengakses /login → arahkan ke home
  if (pathname === "/login") {
    const nextParam = req.nextUrl.searchParams.get("next");
    const url = req.nextUrl.clone();
    url.pathname = nextParam && nextParam !== "/" ? nextParam : "/home";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // default
  return NextResponse.next();
}

// Pastikan middleware tidak menangkap rute internal & API publik
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/(login|logout|ping-backend)).*)",
  ],
};
