import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // penting untuk hosting di belakang proxy / custom domain (Amplify)
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET!,
  session: { strategy: "jwt" },

  providers: [
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],

  // opsional: bantu debugging di server logs Amplify
  debug: true,
  logger: {
    error(error) { console.error("NEXTAUTH ERROR:", error); },
    warn(message) { console.warn("NEXTAUTH WARN:", message); },
    debug(message) { console.log("NEXTAUTH DEBUG:", message); },
  },
});
