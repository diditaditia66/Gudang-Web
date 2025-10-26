"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth";

export default function VerifyPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const email = sp.get("email") || "";

  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      router.push("/login");
    } catch (err: any) {
      setMsg(err.message || "Kode verifikasi salah");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setMsg("");
    try {
      await resendSignUpCode({ username: email });
      setMsg("Kode baru telah dikirim ke email.");
    } catch (err: any) {
      setMsg(err.message || "Gagal mengirim ulang kode");
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gray-50">
      <form
        onSubmit={onVerify}
        className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-lg p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center">Verifikasi Email</h1>
        <p className="text-sm text-gray-500 text-center">
          Masukkan kode verifikasi yang dikirim ke <strong>{email}</strong>
        </p>

        <Input
          placeholder="Kode verifikasi"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Memverifikasi..." : "Verifikasi"}
        </Button>

        <button
          type="button"
          onClick={onResend}
          className="w-full text-sm text-blue-600 hover:underline mt-2"
        >
          Kirim ulang kode
        </button>

        {msg && <p className="text-sm text-center text-red-600">{msg}</p>}
      </form>
    </div>
  );
}
