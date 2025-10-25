// src/app/home/page.tsx
"use client";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { getUsername } from "@/lib/user-client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [u, setU] = useState<string | null>(null);
  useEffect(() => { setU(getUsername()); }, []);
  return (
    <div
      className="min-h-[calc(100vh-56px)] grid"
      style={{ backgroundImage: "url(/assets/background/background1.png)", backgroundSize: "cover", backgroundPosition: "top" }}
    >
      <div className="container py-10">
        <div className="mt-[320px] flex flex-col items-center gap-4">
          {u && <div className="mb-1 text-white/90 font-medium">User: {u}</div>}
          <Link href="/barang/new"><Button className="w-64" variant="primary">Tambah Barang</Button></Link>
          <Link href="/ambil"><Button className="w-64" variant="primary">Ambil Barang</Button></Link>
          <Link href="/list"><Button className="w-64" variant="primary">List Barang</Button></Link>
        </div>
      </div>
    </div>
  );
}
