// src/app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

export default async function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  // Jika tidak ada token, middleware akan otomatis arahkan ke /login
  if (!token) {
    redirect("/login");
  }

  // Verifikasi token (opsional, tapi lebih aman)
  try {
    const decoded = jwt.decode(token);
    if (decoded) {
      redirect("/home");
    } else {
      redirect("/login");
    }
  } catch (error) {
    console.error("JWT decode error:", error);
    redirect("/login");
  }
}
