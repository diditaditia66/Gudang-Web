// src/app/api/debug/env/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  function mask(value?: string) {
    if (!value) return null;
    if (value.length <= 8) return "********";
    return value.slice(0, 6) + "..." + value.slice(-4);
  }

  return NextResponse.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NODE_VERSION: process.version,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || null,
      NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || null,
      BACKEND_BASE: process.env.BACKEND_BASE || null,

      // Masked secrets (only show first/last chars)
      COGNITO_CLIENT_ID: mask(process.env.COGNITO_CLIENT_ID),
      COGNITO_CLIENT_SECRET: mask(process.env.COGNITO_CLIENT_SECRET),
      COGNITO_ISSUER: process.env.COGNITO_ISSUER || null,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      NEXTAUTH_SECRET: mask(process.env.NEXTAUTH_SECRET),

      // Status helpers
      all_present: [
        "BACKEND_BASE",
        "COGNITO_CLIENT_ID",
        "COGNITO_CLIENT_SECRET",
        "COGNITO_ISSUER",
        "NEXTAUTH_SECRET",
        "NEXTAUTH_URL",
      ].every((k) => !!process.env[k]),
    },
  });
}
