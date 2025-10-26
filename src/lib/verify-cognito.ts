import * as jose from "jose";

const REGION = process.env.NEXT_PUBLIC_AWS_REGION!;
const USER_POOL_ID = process.env.NEXT_PUBLIC_USER_POOL_ID!;
const CLIENT_ID = process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!;

const ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;
const JWKS = jose.createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));

export async function verifyIdToken(authHeader?: string) {
  const token = (authHeader || "").replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("No token");

  const { payload } = await jose.jwtVerify(token, JWKS, {
    issuer: ISSUER,
    audience: CLIENT_ID,
  });
  // payload.sub, payload.email, dll.
  return payload;
}
