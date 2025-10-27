// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CognitoProvider from "next-auth/providers/cognito";

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!, // contoh: https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_FGSediYTB
    }),
  ],

  session: { strategy: "jwt" as const },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async session(
      { session, token }: { session: Session; token: JWT }
    ) {
      if (session.user) {
        if (!session.user.name && token?.name) {
          session.user.name = String(token.name);
        }
        if (!session.user.email && token?.email) {
          session.user.email = String(token.email);
        }
      }
      return session;
    },

    async redirect(
      { url, baseUrl }: { url: string; baseUrl: string }
    ) {
      // izinkan path relatif dan URL dengan origin yang sama
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // abaikan URL tidak valid
      }
      return `${baseUrl}/home`;
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
