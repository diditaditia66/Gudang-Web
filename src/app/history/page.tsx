"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Button from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { callBackend } from "@/lib/call-backend";

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
      const r = await callBackend("/get_history");
      if (!r.ok) throw new Error(`Backend ${r.status}`);
      setData(await r.json());
    } catch (e: any) {
      setErr(e?.message || "Gagal memuat history");
    } finally {
      setLoading(false);
    }
  }

  async function hapusSemua() {
    await callBackend("/delete_history", { method: "DELETE" });
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <RequireAuth>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">History</h1>
          <div className="flex items-center gap-3 text-sm">
            <Button variant="secondary" onClick={load} disabled={loading} loading={loading}>
              Refresh
            </Button>
            <Button variant="danger" onClick={hapusSemua} disabled={loading || data.length === 0}>
              Hapus Semua
            </Button>
          </div>
        </div>

        {err && <div className="text-red-600 text-sm">Error: {err}</div>}

        <Card>
          <CardBody>
            <div className="overflow-auto rounded-xl border">
              <table className="table min-w-full">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Nama</th>
                    <th>Jumlah</th>
                    <th>Lokasi</th>
                    <th>Aksi</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-500">
                        Memuat...
                      </td>
                    </tr>
                  ) : data.length ? (
                    data.map((h) => (
                      <tr key={h.id}>
                        <td>{new Date(h.waktu).toLocaleString()}</td>
                        <td>{h.nama_barang}</td>
                        <td>{h.jumlah}</td>
                        <td>
                          <span className="tag">{h.lokasi}</span>
                        </td>
                        <td>{h.aksi}</td>
                        <td>{h.username}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-500">
                        Belum ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </RequireAuth>
  );
}
