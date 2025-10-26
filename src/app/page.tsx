// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Page() {
  // Kalau belum login, middleware akan intercept & redirect ke /login.
  // Kalau sudah login, arahkan root ke /home.
  redirect("/home");
}
