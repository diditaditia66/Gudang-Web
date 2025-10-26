// src/app/login/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EyeIcon({ on }: { on: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="shrink-0">
      {on ? (
        <path fill="currentColor" d="M12 5c-5.5 0-9.7 3.6-11 7 1.3 3.4 5.5 7 11 7s9.7-3.6 11-7c-1.3-3.4-5.5-7-11-7m0 12a5 5 0 1 1 0-10a5 5 0 0 1 0 10" />
      ) : (
        <path fill="currentColor" d="M2.1 3.5L3.5 2.1l18.4 18.4l-1.4 1.4l-3.4-3.4A12 12 0 0 1 12 19c-5.5 0-9.7-3.6-11-7a12.7 12.7 0 0 1 5.8-6.1L2.1 3.5m7.5 6l4.9 4.9a5 5 0 0 0-4.9-4.9m-2.5-2.5l1.7 1.7A6.9 6.9 0 0 1 12 8a5 5 0 0 1 5 5c0 .6-.1 1.2-.3 1.8l1.6 1.6c1.8-1.2 3.2-2.8 3.7-4.4c-1.3-3.4-5.5-7-11-7c-1.7 0-3.4.3-4.9.9" />
      )}
    </svg>
  );
}

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => sp.get("next") || "/", [sp]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Jika sudah login (ada cookie token) langsung redirect
  useEffect(() => {
    if (typeof document !== "undefined" && document.cookie.includes("token=")) {
      router.replace(next);
    }
  }, [router, next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setMsg(data?.message || "Login gagal");
      } else {
        router.replace(next);
      }
    } catch {
      setMsg("Kesalahan jaringan / server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] grid md:grid-cols-2">
      {/* Kiri: hero */}
      <div className="relative hidden md:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/assets/background/background1.png)" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
        <div className="relative h-full w-full flex items-end p-10">
          <div className="max-w-lg text-white">
            <h1 className="text-3xl font-semibold">Gudang Dashboard</h1>
            <p className="text-white/80 mt-2">
              Kelola stok, pencatatan keluar-masuk, dan histori barang Anda dengan cepat dan aman.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                <div className="text-2xl font-semibold">Cepat</div>
                <div className="text-xs text-white/70">Tanpa ribet</div>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                <div className="text-2xl font-semibold">Aman</div>
                <div className="text-xs text-white/70">JWT + proxy</div>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                <div className="text-2xl font-semibold">Real-time</div>
                <div className="text-xs text-white/70">Tanpa reload</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanan: card login */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-gray-50">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm rounded-2xl border bg-white/70 backdrop-blur-md shadow-xl p-6 space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Masuk</h2>
            <p className="text-sm text-gray-500">
              Silakan masuk untuk melanjutkan.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-gray-900/20"
                placeholder="••••••••"
                value={password}
                type={show ? "text" : "password"}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
              >
                <EyeIcon on={show} />
              </button>
            </div>
          </div>

          <button
            className="w-full rounded-xl bg-gray-900 text-white py-2 font-medium shadow hover:bg-black transition disabled:opacity-50"
            disabled={loading || !username || !password}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          {msg && (
            <div className="rounded-lg bg-red-50 text-red-600 text-sm p-3">
              {msg}
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            Dilindungi dengan sesi cookie HttpOnly.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] grid place-items-center">Memuat...</div>}>
      <LoginInner />
    </Suspense>
  );
}
