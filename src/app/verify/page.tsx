"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { confirmSignUp } from "aws-amplify/auth";

function VerifyInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setMsg("Verifikasi berhasil! Anda dapat login sekarang.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setMsg(err.message || "Gagal memverifikasi akun");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-sm rounded-2xl border bg-white shadow-lg p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Verifikasi Email</h1>
        <p className="text-sm text-gray-500 text-center">
          Masukkan kode yang dikirim ke <b>{email}</b>
        </p>

        <Input
          placeholder="Kode verifikasi"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" className="w-full" disabled={!code || loading}>
          {loading ? "Memverifikasi..." : "Verifikasi"}
        </Button>

        {msg && <p className="text-center text-sm text-red-600">{msg}</p>}
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] grid place-items-center">Memuat...</div>}>
      <VerifyInner />
    </Suspense>
  );
}
