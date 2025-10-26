"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signIn, getCurrentUser } from "aws-amplify/auth";

function EyeIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-70">
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
  const next = useMemo(() => sp.get("next") || "/home", [sp]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Jika sudah login, langsung arahkan ke /home
  useEffect(() => {
    getCurrentUser()
      .then(() => router.replace("/home"))
      .catch(() => {}); // belum login -> biarkan di halaman ini
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      // username = email pada konfigurasi kita
      await signIn({ username: email, password });
      router.replace(next);
    } catch (err: any) {
      // Tangani error populer dari Cognito
      if (err?.name === "UserNotConfirmedException") {
        setMsg(
          "Akun belum terverifikasi. Cek email Anda untuk kode verifikasi, lalu buka /verify."
        );
      } else if (err?.name === "NotAuthorizedException") {
        setMsg("Email atau password salah.");
      } else if (err?.name === "UserNotFoundException") {
        setMsg("Akun tidak ditemukan. Silakan daftar terlebih dahulu.");
      } else {
        setMsg(err?.message || "Login gagal");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gray-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-lg p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Login Gudang</h1>
        <p className="text-sm text-gray-500 text-center">
          Masukkan kredensial untuk melanjutkan
        </p>

        <Input
          label="Email"
          type="email"
          placeholder="nama@contoh.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          autoComplete="username"
          required
        />

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            >
              <EyeIcon on={show} />
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          variant="primary"
          loading={loading}
          disabled={!email || !password}
        >
          Masuk
        </Button>

        {/* Link bantuan sederhana (buat nanti kalau sudah ada halamannya) */}
        <div className="flex justify-between text-xs text-gray-600">
          <a className="hover:underline" href="/register">Belum punya akun? Daftar</a>
          <a className="hover:underline" href="/forgot">Lupa password?</a>
        </div>

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
