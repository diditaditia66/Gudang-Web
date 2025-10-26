// src/amplify.ts
"use client";
import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito: {
      // ❌ JANGAN tulis `region` di sini pada v6
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,              // contoh: ap-southeast-1_abCdEf123
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!, // App client (tanpa client secret)
      loginWith: { email: true, phone: false, username: false },      // kita login pakai email
      // Opsi lain yang valid di v6 (opsional):
      // passwordFormat: { minLength: 8, requireNumbers: true, requireLowercase: true, requireUppercase: true, requireSpecialCharacters: false }
    },
  },
});
