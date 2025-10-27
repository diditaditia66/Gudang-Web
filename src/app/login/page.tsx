"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { signIn, useSession } from "next-auth/react";

function LoginInner() {
  const { status } = useSession();
  const router = useRouter();
  const sp = useSearchParams();
  const next = useMemo(() => sp.get("next") || "/home", [sp]);

  useEffect(() => {
    if (status === "authenticated") router.replace(next);
  }, [status, next, router]);

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-lg p-6 space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Login Gudang</h1>
        <p className="text-sm text-gray-500">Gunakan akun Cognito untuk melanjutkan.</p>

        <Button
          className="w-full"
          variant="primary"
          onClick={() => signIn("cognito", { callbackUrl: next })}
        >
          Masuk dengan Cognito
        </Button>

        <p className="text-xs text-gray-500">
          Setelah login, Anda akan diarahkan ke <b>{next}</b>.
        </p>
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
