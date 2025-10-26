"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type History = {
  id: number;
  nama_barang: string;
  jumlah: number;
  lokasi: string;
  aksi: string;
  username: string;
  waktu: string;
};

export default function HistoryPage() {
  const [data, setData] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get_history`, {
        cache: "no-store",
      });
      if (!r.ok) throw new Error(`Backend ${r.status}`);
      const json: History[] = await r.json();
      setData(json);
    } catch (e: any) {
      setErr(e?.message || "Gagal memuat history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">History</h1>

      <div className="flex items-center gap-3 text-sm">
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "Memuat..." : "Refresh"}
        </button>
        <Link className="link" href="/barang/new">
          Tambah Barang
        </Link>
      </div>

      {err && <div className="text-red-600 text-sm">Error: {err}</div>}

      <div className="overflow-auto rounded-xl border">
        <table className="table">
          <thead>
            <tr>
              <th className="th">Waktu</th>
              <th className="th">Nama</th>
              <th className="th">Jumlah</th>
              <th className="th">Lokasi</th>
              <th className="th">Aksi</th>
              <th className="th">User</th>
            </tr>
          </thead>
          <tbody>
            {data.map((h) => (
              <tr key={h.id}>
                <td className="td">{new Date(h.waktu).toLocaleString()}</td>
                <td className="td">{h.nama_barang}</td>
                <td className="td">{h.jumlah}</td>
                <td className="td">
                  <span className="tag">{h.lokasi}</span>
                </td>
                <td className="td">{h.aksi}</td>
                <td className="td">{h.username}</td>
              </tr>
            ))}
            {!loading && data.length === 0 && (
              <tr>
                <td className="td" colSpan={6}>
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
