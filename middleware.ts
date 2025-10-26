// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Path publik yang tidak perlu token
const PUBLIC_PATHS = ["/login", "/api/login", "/_next", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const token = req.cookies.get("token")?.value;

  // Jika belum login dan bukan halaman publik -> redirect ke login
  if (!token && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Jika sudah login dan buka halaman login -> redirect ke home
  if (token && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Pastikan middleware tidak menangkap rute internal
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/(login|logout)).*)"],
};
