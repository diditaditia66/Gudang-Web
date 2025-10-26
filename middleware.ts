// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Biarkan semua lewat; proteksi dilakukan di client (RequireAuth) & di API handler (verifikasi JWT)
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
