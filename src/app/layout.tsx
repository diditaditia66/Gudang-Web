"use client";

import "./globals.css";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function HeaderBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const username =
    (session?.user?.name as string) ||
    (session?.user?.email as string) ||
    "";

  const navItems = [
    { label: "Home", href: "/home" },
    { label: "Tambah", href: "/barang/new" },
    { label: "Ambil", href: "/ambil" },
    { label: "List", href: "/list" },
    { label: "History", href: "/history" },
  ];

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between w-full md:w-auto mb-2 md:mb-0">
        <Link href="/" className="text-2xl font-semibold text-gray-800">
          🏷️ Gudang
        </Link>
        {status === "authenticated" && username && (
          <span className="text-sm text-gray-600 ml-2 md:hidden">
            Halo, <b>{username}</b>
          </span>
        )}
      </div>

      {status === "authenticated" && (
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

      <div className="mt-2 md:mt-0">
        {status === "authenticated" ? (
          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-sm text-gray-600">
              Halo, <b>{username}</b>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("cognito", { callbackUrl: "/home" })}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {/* ✅ SessionProvider membutuhkan children */}
        <SessionProvider session={undefined}>
          <HeaderBar />
          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="text-center py-4 text-xs text-gray-500 border-t bg-white">
            © {new Date().getFullYear()} Gudang App — Didit Aditia
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
