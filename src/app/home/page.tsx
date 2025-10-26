// src/app/home/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { getUsername } from "@/lib/user-client";

function ActionCard({
  href,
  title,
  desc,
  emoji,
}: {
  href: string;
  title: string;
  desc: string;
  emoji: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-white/70 backdrop-blur-md hover:bg-white shadow-md hover:shadow-xl transition block p-5"
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{emoji}</div>
        <div>
          <div className="font-semibold group-hover:text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{desc}</div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [u, setU] = useState<string | null>(null);
  useEffect(() => setU(getUsername()), []);

  return (
    <div className="relative min-h-[calc(100vh-56px)]">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-top"
        style={{ backgroundImage: "url(/assets/background/background1.png)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/70 to-white" />

      {/* content */}
      <div className="relative container mx-auto px-4 py-10">
        <div className="text-center">
          {u && (
            <div className="inline-block rounded-full bg-white/70 backdrop-blur px-4 py-1 text-sm text-gray-700 shadow">
              Masuk sebagai <b>{u}</b>
            </div>
          )}
          <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
            Selamat datang di <span className="underline decoration-gray-300">Gudang</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Kelola stok & riwayat barang Anda dengan mudah.
          </p>
        </div>

        {/* quick actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            href="/barang/new"
            title="Tambah Barang"
            desc="Input barang baru atau tambah jumlah."
            emoji="➕"
          />
          <ActionCard
            href="/ambil"
            title="Ambil Barang"
            desc="Catat pengambilan stok secara cepat."
            emoji="📦"
          />
          <ActionCard
            href="/list"
            title="List Barang"
            desc="Lihat, cari, dan kelola data barang."
            emoji="📋"
          />
        </div>

        {/* big CTA (tambahan tombol besar) */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/barang/new">
            <Button className="w-64" variant="primary">Tambah Barang</Button>
          </Link>
          <Link href="/ambil">
            <Button className="w-64" variant="primary">Ambil Barang</Button>
          </Link>
          <Link href="/list">
            <Button className="w-64" variant="primary">List Barang</Button>
          </Link>
        </div>

        {/* info box */}
        <div className="mt-10 mx-auto max-w-3xl rounded-2xl border bg-white/70 backdrop-blur-md p-5 shadow">
          <div className="font-medium text-gray-800">Tips</div>
          <ul className="mt-2 text-sm text-gray-600 list-disc pl-5 space-y-1">
            <li>Gunakan kolom pencarian di halaman “List Barang” untuk menemukan item lebih cepat.</li>
            <li>Semua aksi (tambah/ambil/hapus) otomatis tercatat di “History”.</li>
            <li>Keamanan: login menggunakan cookie HttpOnly & validasi JWT di server.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
