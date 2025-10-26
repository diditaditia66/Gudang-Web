"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      try {
        const decoded = jwt.decode(token) as { username?: string };
        setUsername(decoded?.username || null);
      } catch {
        setUsername(null);
      }
    }
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center px-8 py-4 bg-white border-b shadow-sm">
          <div className="text-xl font-bold text-gray-800">
            {username ? `👋 ${username}` : "Gudang"}
          </div>
          <div>
            {username ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
              >
                Login
              </Link>
            )}
          </div>
        </header>

        {/* Konten halaman */}
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
