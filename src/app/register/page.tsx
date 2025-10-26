"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { signUp } from "aws-amplify/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email },
        },
      });
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setMsg(err.message || "Gagal mendaftar");
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
        <h1 className="text-2xl font-semibold text-center">Daftar Akun Gudang</h1>
        <p className="text-sm text-gray-500 text-center">
          Gunakan email dan password untuk mendaftar
        </p>

        <Input
          type="email"
          placeholder="nama@contoh.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password minimal 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : "Daftar"}
        </Button>

        {msg && <p className="text-sm text-red-600 text-center">{msg}</p>}

        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Masuk
          </a>
        </p>
      </form>
    </div>
  );
}
