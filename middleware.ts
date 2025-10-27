// middleware.ts
export { auth as middleware } from "@/auth";
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|assets/).*)",
    "/home",
    "/ambil",
    "/list",
    "/history",
    "/barang/:path*",
    "/api/backend/:path*", // tetap proteksi
  ],
};
