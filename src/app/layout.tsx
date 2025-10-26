// src/app/layout.tsx
import "./globals.css";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Gudang",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  let username: string | null = null;

  if (token) {
    try {
      const decoded = jwt.decode(token) as { username?: string };
      username = decoded?.username || null;
    } catch {
      username = null;
    }
  }

  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center px-8 py-4 bg-white shadow-sm border-b">
          <div className="text-xl font-bold text-gray-800">
            {username ? `👋 ${username}` : "Gudang"}
          </div>
          <div>
            {username ? (
              <form action="/api/logout" method="post">
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </form>
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
