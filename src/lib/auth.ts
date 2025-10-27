// src/lib/auth.ts
import NextAuth, { type NextAuthOptions, getServerSession } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";

export const authOptions: NextAuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
    }),
  ],
  session: {
    strategy: "jwt", // <- sudah bertipe 'jwt' karena objeknya NextAuthOptions
  },
  callbacks: {
    async session({ session, token }) {
      // map minimal agar selalu ada name/email
      if (token?.email && session.user) session.user.email = String(token.email);
      if (token?.name && session.user && !session.user.name) session.user.name = String(token.name);
      return session;
    },
  },
  pages: {
    signIn: "/login", // optional: pakai halaman login kustom Anda
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

// helper untuk server (route/proxy)
export function getAuthSession() {
  return getServerSession(authOptions);
}
