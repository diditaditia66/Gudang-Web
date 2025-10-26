"use client";

import { useEffect, useMemo, useState } from "react";
import { getUsername } from "@/lib/user-client";

type Barang = { nama_barang: string; jumlah: number; lokasi: string };
type History = { id: number; nama_barang: string; jumlah: number; lokasi: string; aksi: string; username: string; waktu: string };

export default function AmbilPage() {
  const [username, setUsername] = useState<string>("");
  const [nama, setNama] = useState("");
  const [jumlah, setJumlah] = useState<number | "">("");
  const [lokasi, setLokasi] = useState("");
  const [all, setAll] = useState<Barang[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [busy, setBusy] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [msgOk, setMsgOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmAll, setConfirmAll] = useState(false);

  useEffect(() => {
    const u = getUsername();
    if (u) setUsername(u);
    reloadAll();
  }, []);

  async function reloadAll() {
    setLoading(true);
    try {
      const [rb, rh] = await Promise.all([
        fetch("/api/backend/get_barang", { cache: "no-store" }),
        fetch("/api/backend/get_history", { cache: "no-store" }),
      ]);
      setAll(rb.ok ? await rb.json() : []);
      setHistory(rh.ok ? await rh.json() : []);
    } catch {
      setMsgError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  const suggestNama = useMemo(() => {
    const q = nama.toLowerCase().trim();
    if (!q) return [];
    return all
      .map((b) => b.nama_barang)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .filter((v) => v.toLowerCase().includes(q))
      .slice(0, 8);
  }, [all, nama]);

  const lokasiList = useMemo(() => {
    return all
      .filter((b) => b.nama_barang === nama)
      .map((b) => b.lokasi)
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }, [all, nama]);

  async function ambil() {
    if (!nama || !lokasi || !jumlah) return;
    setBusy(true);
    setMsgError(null);
    setMsgOk(null);
    try {
      const res = await fetch("/api/backend/ambil_barang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_barang: nama, jumlah, lokasi, aksi: "Ambil Barang", username }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Gagal ambil barang");
      setMsgOk("✅ Berhasil mencatat pengambilan.");
      setNama("");
      setJumlah("");
      setLokasi("");
      reloadAll();
    } catch (err: any) {
      setMsgError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ambil Barang</h1>
        <button onClick={reloadAll} className="btn-secondary rounded-lg" disabled={loading}>
          {loading ? "Memuat..." : "Refresh"}
        </button>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ambil();
            }}
            className="grid gap-4 md:grid-cols-4"
          >
            <div className="relative">
              <input
                className="input"
                placeholder="Nama Barang"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />
              {suggestNama.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow max-h-48 overflow-auto">
                  {suggestNama.map((s) => (
                    <li
                      key={s}
                      onClick={() => setNama(s)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input
              className="input"
              type="number"
              min={1}
              placeholder="Jumlah"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value === "" ? "" : Number(e.target.value))}
            />
            {lokasiList.length ? (
              <select className="input" value={lokasi} onChange={(e) => setLokasi(e.target.value)}>
                <option value="">Pilih lokasi</option>
                {lokasiList.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                placeholder="Lokasi"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
              />
            )}
            <button type="submit" className="btn-primary w-full rounded-lg" disabled={busy}>
              {busy ? "Memproses..." : "Catat Pengambilan"}
            </button>
          </form>

          {msgError && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
              {msgError}
            </div>
          )}
          {msgOk && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 text-sm">
              {msgOk}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Riwayat Pengambilan</h2>
        <button className="btn-danger rounded-lg" onClick={() => setConfirmAll(true)}>
          Hapus Semua
        </button>
      </div>

      <div className="overflow-auto rounded-xl border bg-white">
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
            {history.length ? (
              history.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="td">{new Date(h.waktu).toLocaleString()}</td>
                  <td className="td">{h.nama_barang}</td>
                  <td className="td">{h.jumlah}</td>
                  <td className="td">{h.lokasi}</td>
                  <td className="td">{h.aksi}</td>
                  <td className="td">{h.username}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-6">
                  📭 Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmAll && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
            <h3 className="text-lg font-semibold mb-3">Konfirmasi</h3>
            <p>Yakin ingin menghapus <b>semua</b> history?</p>
            <div className="mt-4 flex justify-end gap-3">
              <button className="btn" onClick={() => setConfirmAll(false)}>
                Batal
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  fetch("/api/backend/delete_history", { method: "DELETE" }).then(() =>
                    reloadAll()
                  );
                  setConfirmAll(false);
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
