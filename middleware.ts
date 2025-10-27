export { default } from "next-auth/middleware";

// Tentukan route yang WAJIB login (sisanya publik).
export const config = {
  matcher: [
    "/home",
    "/ambil",
    "/list",
    "/history",
    "/barang/:path*",
    "/api/backend/:path*",   // proteksi proxy ke backend juga
  ],
};
