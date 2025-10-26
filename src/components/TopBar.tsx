"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import { getUsername } from "@/lib/user-client";

export default function TopBar() {
  const router = useRouter();
  const pathname = usePathname();

  // Ambil username dari cookie 'u'
  const [username, setUsername] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setUsername(getUsername() || null);
    setAuthed(document.cookie.includes("token="));
  }, [pathname]);

  async function logout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      // paksa refresh ke halaman login
      router.replace("/login");
    }
  }

  return (
    <div className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto max-w-6xl h-14 px-4 flex items-center justify-between">
        {/* Kiri: brand + username */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-semibold text-gray-900 hover:text-indigo-600 transition"
            aria-label="Beranda Gudang"
          >
            Gudang
          </Link>
          {authed && (
            <span className="text-sm text-gray-600">
              • <span className="font-medium text-gray-800">{username || "-"}</span>
            </span>
          )}
        </div>

        {/* Kanan: Login / Logout */}
        <div className="flex items-center gap-2">
          {!authed ? (
            <Link href="/login">
              <Button variant="primary" className="px-4 py-1.5">Login</Button>
            </Link>
          ) : (
            <Button className="px-4 py-1.5" onClick={logout}>Logout</Button>
          )}
        </div>
      </div>
    </div>
  );
}
