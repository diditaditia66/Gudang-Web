"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUsername } from "@/lib/user-client";
import { Plus, PackageOpen, FileText } from "lucide-react";

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => setUsername(getUsername()), []);

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center bg-gray-50">
      <div className="container text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
          Selamat datang di <span className="text-indigo-600">Gudang</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Kelola stok &amp; riwayat barang Anda dengan mudah dan cepat.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          <Link href="/barang/new" className="group">
            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-md border transition">
              <div className="p-3 bg-indigo-500 text-white rounded-full">
                <Plus size={28} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600">
                  Tambah Barang
                </h3>
                <p className="text-sm text-gray-500">
                  Input barang baru atau tambah jumlah.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/ambil" className="group">
            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-md border transition">
              <div className="p-3 bg-amber-500 text-white rounded-full">
                <PackageOpen size={28} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-amber-600">
                  Ambil Barang
                </h3>
                <p className="text-sm text-gray-500">
                  Catat pengambilan stok secara cepat.
                </p>
              </div>
            </div>
          </Link>

          <Link href="/list" className="group">
            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-md border transition">
              <div className="p-3 bg-pink-500 text-white rounded-full">
                <FileText size={28} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-pink-600">
                  List Barang
                </h3>
                <p className="text-sm text-gray-500">
                  Lihat, cari, dan kelola data barang.
                </p>
              </div>
            </div>
          </Link>
        </div>

        {username && (
          <div className="mt-6 text-gray-500 text-sm">
            Login sebagai <b className="text-gray-800">{username}</b>
          </div>
        )}
      </div>
    </div>
  );
}
