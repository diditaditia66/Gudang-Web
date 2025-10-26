"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, signOut } from "aws-amplify/auth";
import "@/amplify";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Ambil user login dari Cognito
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setUsername(user?.signInDetails?.loginId || user?.username || "User");
      } catch {
        setUsername(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // ✅ Logout langsung dari Cognito
  async function handleLogout() {
    try {
      await signOut();
      router.replace("/login");
    } catch (e) {
      console.error("Gagal logout:", e);
    }
  }

  const navItems = [
    { label: "Home", href: "/home" },
    { label: "Tambah", href: "/barang/new" },
    { label: "Ambil", href: "/ambil" },
    { label: "List", href: "/list" },
    { label: "History", href: "/history" },
  ];

  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 bg-white border-b shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between w-full md:w-auto mb-2 md:mb-0">
            <Link href="/" className="text-2xl font-semibold text-gray-800">
              🏷️ Gudang
            </Link>
            {!loading && username && (
              <span className="text-sm text-gray-600 ml-2 md:hidden">
                Halo, <b>{username}</b>
              </span>
            )}
          </div>

          {/* NAVBAR */}
          {!loading && username && (
            <nav className="flex gap-3 flex-wrap justify-center md:justify-start">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    pathname === item.href
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* USER ACTION */}
          <div className="mt-2 md:mt-0">
            {loading ? null : username ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-sm text-gray-600">
                  Halo, <b>{username}</b>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
              >
                Login
              </Link>
            )}
          </div>
        </header>

        {/* KONTEN */}
        <main className="flex-grow container mx-auto px-4 py-6">{children}</main>

        {/* FOOTER */}
        <footer className="text-center py-4 text-xs text-gray-500 border-t bg-white">
          © {new Date().getFullYear()} Gudang App — Didit Aditia
        </footer>
      </body>
    </html>
  );
}
