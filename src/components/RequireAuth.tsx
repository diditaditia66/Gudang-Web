"use client";

import { ReactNode, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Kembali ke halaman ini setelah login
      signIn("cognito", { callbackUrl: pathname || "/home" });
    }
  }, [status, pathname]);

  if (status !== "authenticated") {
    return (
      <div className="min-h-[50vh] grid place-items-center text-gray-500">
        Memuat sesi...
      </div>
    );
  }
  return <>{children}</>;
}
