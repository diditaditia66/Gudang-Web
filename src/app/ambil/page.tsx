// src/app/ambil/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Autocomplete from "@/components/ui/Autocomplete";
import Modal from "@/components/ui/Modal";
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
  const [confirmAll, setConfirmAll] = useState(false);

  // UI states
  const [busy, setBusy] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [msgOk, setMsgOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const u = getUsername(); if (u) setUsername(u); }, []);
  useEffect(() => { void reloadAll(); }, []);

  async function reloadAll() {
    setLoading(true);
    setMsgError(null);
    try {
      const [rb, rh] = await Promise.all([
        fetch("/api/backend/get_barang", { cache: "no-store" }),
        fetch("/api/backend/get_history", { cache: "no-store" })
      ]);
      setAll(rb.ok ? await rb.json() : []);
      setHistory(rh.ok ? await rh.json() : []);
    } catch (e: any) {
      setMsgError(e?.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  const suggestNama = useMemo(() => {
    const q = nama.toLowerCase().trim();
    if (!q) return [];
    return all
      .map(b => b.nama_barang)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .filter(v => v.toLowerCase().includes(q))
      .slice(0, 8);
  }, [all, nama]);

  function pickNama(v: string) {
    setNama(v);
    // Jika ada baris cocok, auto set lokasi pertama
    const found = all.find(b => b.nama_barang === v);
    if (found) setLokasi(found.lokasi);
  }

  const stokSaatIni = useMemo(() => {
    if (!nama) return undefined;
    // stok gabungan semua lokasi untuk nama tsb
    const total = all
      .filter(b => b.nama_barang === nama)
      .reduce((acc, it) => acc + (Number(it.jumlah) || 0), 0);
    return isNaN(total) ? 0 : total;
  }, [all, nama]);

  const canSubmit = nama && lokasi && jumlah !== "" && Number(jumlah) > 0;

  async function ambil() {
    if (!canSubmit) return;
    setBusy(true);
    setMsgError(null);
    setMsgOk(null);
    try {
      const res = await fetch("/api/backend/ambil_barang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_barang: nama, jumlah: Number(jumlah), lokasi, aksi: "Ambil Barang", username })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsgError(data?.message || "Gagal ambil barang");
        return;
      }
      setMsgOk("Berhasil mencatat pengambilan.");
      setNama(""); setJumlah(""); setLokasi("");
      await reloadAll();
    } catch (e: any) {
      setMsgError(e?.message || "Kesalahan jaringan / server");
    } finally {
      setBusy(false);
    }
  }

  async function hapusHistory(id?: number) {
    setBusy(true);
    try {
      await fetch("/api/backend/delete_history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : {})
      });
      setConfirmAll(false);
      await reloadAll();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Ambil Barang</h1>
          <div className="text-sm text-gray-600">User: <b>{username || "-"}</b></div>
        </div>
        <Button onClick={() => reloadAll()} disabled={loading} variant="secondary">
          {loading ? "Memuat..." : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardBody>
          <form
            className="grid gap-3 md:grid-cols-4"
            onSubmit={(e) => { e.preventDefault(); if (canSubmit) void ambil(); }}
          >
            <div>
              <Autocomplete
                value={nama}
                onChange={setNama}
                suggestions={suggestNama}
                onPick={pickNama}
                placeholder="Nama Barang"
              />
              {!!stokSaatIni && (
                <div className="mt-1 text-xs text-gray-500">
                  Perkiraan stok total: <b>{stokSaatIni}</b>
                </div>
              )}
            </div>

            <div>
              <Input
                type="number"
                min={1}
                placeholder="Jumlah diambil"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <div className="mt-1 text-xs text-gray-500">Isi angka &gt; 0</div>
            </div>

            <div>
              <Input
                placeholder="Lokasi"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
              />
              <div className="mt-1 text-xs text-gray-500">Contoh: Rak A, Gudang A</div>
            </div>

            <div className="flex items-end">
              <Button className="w-full" variant="primary" disabled={!canSubmit || busy}>
                {busy ? "Memproses..." : "Catat Pengambilan"}
              </Button>
            </div>
          </form>

          {msgError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {msgError}
            </div>
          )}
          {msgOk && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
              {msgOk}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">History</h2>
        <Button onClick={() => setConfirmAll(true)} disabled={busy}>Hapus Semua History</Button>
      </div>

      <Card>
        <CardBody>
          <div className="overflow-auto rounded-xl border">
            <table className="table">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="th">Waktu</th>
                  <th className="th">Nama</th>
                  <th className="th">Jumlah</th>
                  <th className="th">Lokasi</th>
                  <th className="th">Aksi</th>
                  <th className="th">User</th>
                  <th className="th w-24">Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((h, i) => (
                  <tr key={h.id} className={i % 2 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="td">{new Date(h.waktu).toLocaleString()}</td>
                    <td className="td">{h.nama_barang}</td>
                    <td className="td">{h.jumlah}</td>
                    <td className="td"><span className="tag">{h.lokasi ?? "-"}</span></td>
                    <td className="td">{h.aksi}</td>
                    <td className="td">{h.username ?? "-"}</td>
                    <td className="td">
                      <Button variant="secondary" onClick={() => hapusHistory(h.id)} disabled={busy}>Hapus</Button>
                    </td>
                  </tr>
                ))}
                {!loading && history.length === 0 && (
                  <tr>
                    <td className="td py-10 text-center text-gray-500" colSpan={7}>
                      <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 grid place-items-center mb-2">📭</div>
                      Belum ada history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Modal open={confirmAll} onClose={() => setConfirmAll(false)} title="Konfirmasi">
        <p>Hapus <b>semua</b> history?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={() => setConfirmAll(false)} disabled={busy}>Batal</button>
          <button className="btn btn-primary" onClick={() => hapusHistory(undefined)} disabled={busy}>Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
