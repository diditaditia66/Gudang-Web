// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Prefix publik (tidak butuh token)
const PUBLIC_PREFIXES = ["/_next", "/assets", "/favicon.ico"] as const;
// API publik (boleh tanpa token)
const PUBLIC_API = ["/api/login", "/api/logout", "/api/ping-backend"] as const;

function isPublicPath(pathname: string) {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) return true;
  // Halaman login dianggap publik khusus (ditangani terpisah di bawah)
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get("token")?.value ?? null;

  // 1) Izinkan semua public assets & API publik
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 2) Jika belum login
  if (!token) {
    // a) Untuk request API non-publik → balas 401 JSON (lebih ramah fetch)
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    // b) Untuk halaman biasa → redirect ke /login?next=<path+query>
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // 3) Jika sudah login dan mengakses /login → arahkan ke next atau /home
  if (pathname === "/login") {
    const nextParam = req.nextUrl.searchParams.get("next");
    const url = req.nextUrl.clone();
    url.pathname = nextParam && nextParam !== "/" ? nextParam : "/home";
    url.search = ""; // bersihkan query
    return NextResponse.redirect(url);
  }

  // Default: lanjutkan
  return NextResponse.next();
}

// Pastikan middleware tidak menangkap rute internal & API publik
export const config = {
  matcher: [
    // Tangkap semua KECUALI:
    // - _next/* (file internal Next)
    // - _next/image (image optimizer)
    // - favicon.ico
    // - assets/* (gambar, css custom)
    // - api/login, api/logout, api/ping-backend (API publik)
    "/((?!_next/static|_next/image|favicon.ico|assets/|api/(login|logout|ping-backend)).*)",
  ],
};
