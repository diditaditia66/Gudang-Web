"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUsername } from "@/lib/user-client";
import { Plus, PackageOpen, FileText } from "lucide-react";

export default function HomePage() {
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => setUsername(getUsername()), []);

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="container text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
          Selamat datang di <span className="text-indigo-600">Gudang</span>
        </h1>
        <p className="text-gray-600 mb-8">
          Kelola stok & riwayat barang Anda dengan mudah dan cepat.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          <Link href="/barang/new" className="group">
            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md border transition-all duration-200">
              <div className="p-3 bg-gradient-to-r from-indigo-400 to-purple-500 text-white rounded-full shadow">
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
            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md border transition-all duration-200">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-full shadow">
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
            <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md border transition-all duration-200">
              <div className="p-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full shadow">
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

        <div className="max-w-3xl mx-auto bg-white/60 backdrop-blur-sm border rounded-2xl p-6 shadow-sm text-left">
          <h4 className="font-semibold mb-2 text-gray-800">Tips</h4>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Gunakan kolom pencarian di halaman “List Barang” untuk menemukan item lebih cepat.</li>
            <li>Semua aksi (tambah/ambil/hapus) otomatis tercatat di “History”.</li>
            <li>Login aman menggunakan cookie HttpOnly & validasi JWT di server.</li>
          </ul>
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
