// src/lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CognitoProvider from "next-auth/providers/cognito";

export const authConfig: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!, // contoh: https://ap-southeast-2-FGSediYTB.auth.ap-southeast-2.amazoncognito.com
    }),
  ],
  callbacks: {
    async session(
      { session, token }: { session: Session; token: JWT }
    ) {
      if (!session.user?.name && token?.name)  session.user!.name  = String(token.name);
      if (!session.user?.email && token?.email) session.user!.email = String(token.email);
      return session;
    },
  },
  session: { strategy: "jwt" },        // as const juga oke
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET!, // pastikan ada di env build/prod
};
