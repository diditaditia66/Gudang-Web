// src/components/Nav.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const tabs = [
  { href: "/", label: "Barang" },
  { href: "/barang/new", label: "Tambah" },
  { href: "/history", label: "History" },
];

export default function Nav() {
  const p = usePathname();
  const r = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // token HttpOnly tak bisa dibaca; pakai cookie 'u' untuk indikasi login
    setLoggedIn(document.cookie.includes("u="));
  }, [p]);

  async function onLogout() {
    await fetch("/api/logout", { method: "POST" });
    // refresh state cookie
    r.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">{process.env.NEXT_PUBLIC_APP_NAME || "Gudang"}</Link>
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`px-3 py-2 rounded-lg text-sm ${p === t.href ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
            >
              {t.label}
            </Link>
          ))}
          {!loggedIn ? (
            <Link
              href="/login"
              className={`px-3 py-2 rounded-lg text-sm ${p === "/login" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
            >
              Login
            </Link>
          ) : (
            <button onClick={onLogout} className="px-3 py-2 rounded-lg text-sm hover:bg-gray-100">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
