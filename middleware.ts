export { default } from "next-auth/middleware";

// Tentukan route yang WAJIB login (sisanya publik).
export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|assets/).*)',
    "/home",
    "/ambil",
    "/list",
    "/history",
    "/barang/:path*",
    "/api/backend/:path*",   // proteksi proxy ke backend juga
  ],
};
