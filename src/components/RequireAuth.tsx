"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth";

/** Membatasi akses ke children jika belum login (redirect ke /login?next=...) */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then(() => mounted && setReady(true))
      .catch(() => router.replace(`/login?next=${encodeURIComponent(pathname)}`));
    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="min-h-[50vh] grid place-items-center text-gray-600">
        Memuat…
      </div>
    );
  }

  return <>{children}</>;
}
