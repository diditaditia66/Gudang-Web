"use client";
import { useEffect, useState } from "react";

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
      const r = await fetch("/api/backend/get_history", { cache: "no-store" });
      if (!r.ok) throw new Error(`Backend ${r.status}`);
      const json: History[] = await r.json();
      setData(json);
    } catch (e: any) {
      setErr(e?.message || "Gagal memuat history");
    } finally {
      setLoading(false);
    }
  }

  async function hapusSemua() {
    await fetch("/api/backend/delete_history", { method: "DELETE" });
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">History</h1>

      <div className="flex items-center gap-3 text-sm">
        <button className="btn" onClick={load} disabled={loading}>{loading ? "Memuat..." : "Refresh"}</button>
        <button className="btn btn-primary" onClick={hapusSemua}>Hapus Semua</button>
      </div>

      {err && <div className="text-red-600 text-sm">Error: {err}</div>}

      <div className="overflow-auto rounded-xl border">
        <table className="table">
          <thead><tr>
            <th>Waktu</th><th>Nama</th><th>Jumlah</th><th>Lokasi</th><th>Aksi</th><th>User</th>
          </tr></thead>
          <tbody>
            {data.map(h => (
              <tr key={h.id}>
                <td>{new Date(h.waktu).toLocaleString()}</td>
                <td>{h.nama_barang}</td>
                <td>{h.jumlah}</td>
                <td><span className="tag">{h.lokasi}</span></td>
                <td>{h.aksi}</td>
                <td>{h.username}</td>
              </tr>
            ))}
            {!loading && data.length === 0 && (
              <tr><td colSpan={6}>Belum ada data.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
