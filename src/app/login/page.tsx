// src/app/login/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EyeIcon({ on }: { on: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      {on ? (
        <path
          fill="currentColor"
          d="M12 5c-5.5 0-9.7 3.6-11 7 1.3 3.4 5.5 7 11 7s9.7-3.6 11-7c-1.3-3.4-5.5-7-11-7m0 12a5 5 0 1 1 0-10a5 5 0 0 1 0 10"
        />
      ) : (
        <path
          fill="currentColor"
          d="M2.1 3.5L3.5 2.1l18.4 18.4l-1.4 1.4l-3.4-3.4A12 12 0 0 1 12 19c-5.5 0-9.7-3.6-11-7a12.7 12.7 0 0 1 5.8-6.1L2.1 3.5m7.5 6l4.9 4.9a5 5 0 0 0-4.9-4.9"
        />
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

  useEffect(() => {
    if (document.cookie.includes("token=")) router.replace(next);
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
      if (!r.ok) setMsg(data?.message || "Login gagal");
      else router.replace(next);
    } catch {
      setMsg("Kesalahan jaringan / server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border bg-white shadow-lg p-6 space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center">Login Gudang</h2>
        <p className="text-sm text-gray-500 text-center mb-2">
          Masukkan kredensial untuk melanjutkan
        </p>

        <input
          className="w-full rounded-xl border px-3 py-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="relative">
          <input
            className="w-full rounded-xl border px-3 py-2 pr-10"
            placeholder="Password"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
          >
            <EyeIcon on={show} />
          </button>
        </div>

        <button
          className="w-full rounded-xl bg-gray-900 text-white py-2 font-medium hover:bg-black transition disabled:opacity-50"
          disabled={loading || !username || !password}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>

        {msg && <p className="text-sm text-red-600 text-center">{msg}</p>}
      </form>
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
