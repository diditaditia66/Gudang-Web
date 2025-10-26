// src/app/login/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Jika sudah login (ada cookie token) langsung redirect
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
      if (!r.ok) {
        setMsg(data?.message || "Login gagal");
      } else {
        router.replace(next);
      }
    } catch (e: any) {
      setMsg("Kesalahan jaringan / server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-3 border p-6 rounded-xl bg-white shadow-md"
      >
        <h1 className="text-xl font-semibold">Login</h1>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full rounded-lg bg-gray-900 text-white py-2 disabled:opacity-50"
          disabled={loading || !username || !password}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] grid place-items-center">Memuat...</div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}

// Jika ingin hindari pre-render penuh (opsional):
// export const dynamic = "force-dynamic";
// export const revalidate = 0;
