"use client";

import { useEffect, useMemo, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Button from "@/components/ui/Button";
import Autocomplete from "@/components/ui/Autocomplete";
import Input from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { callBackend } from "@/lib/call-backend";
import { useSession } from "next-auth/react";

type Barang = { nama_barang: string; jumlah: number; lokasi: string };
type History = {
  id: number;
  nama_barang: string;
  jumlah: number;
  lokasi: string | null;
  aksi: string;
  username: string | null;
  waktu: string;
};

export default function AmbilPage() {
  const { data: session } = useSession();
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
    const email = (session?.user?.email as string) || (session?.user?.name as string) || "";
    setUsername(email);
  }, [session]);

  useEffect(() => {
    void reloadAll();
  }, []);

  async function reloadAll() {
    setLoading(true);
    setMsgError(null);
    try {
      const [rb, rh] = await Promise.all([
        callBackend("/get_barang"),
        callBackend("/get_history"),
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
    return Array.from(new Set(all.map((b) => b.nama_barang)))
      .filter((v) => v.toLowerCase().includes(q))
      .slice(0, 8);
  }, [all, nama]);

  const lokasiList = useMemo(() => {
    return Array.from(new Set(all.filter((b) => b.nama_barang === nama).map((b) => b.lokasi)));
  }, [all, nama]);

  const stokSaatIni = useMemo(() => {
    if (!nama) return undefined;
    const total = all
      .filter((b) => b.nama_barang === nama)
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
      const res = await callBackend("/ambil_barang", {
        method: "POST",
        body: JSON.stringify({
          nama_barang: nama,
          jumlah: Number(jumlah),
          lokasi,
          aksi: "Ambil Barang",
          username,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Gagal ambil barang");
      setMsgOk("✅ Berhasil mencatat pengambilan.");
      setNama("");
      setJumlah("");
      setLokasi("");
      await reloadAll();
    } catch (err: any) {
      setMsgError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const ambilOnlyHistory = useMemo(
    () =>
      history
        .filter((h) => /ambil/i.test(h.aksi || "")) // hanya riwayat ambil
        .sort((a, b) => +new Date(b.waktu) - +new Date(a.waktu)),
    [history]
  );

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ambil Barang</h1>
            <p className="text-sm text-gray-600">
              User: <b>{username || "-"}</b>
            </p>
          </div>
          <Button onClick={reloadAll} variant="ghost" disabled={loading} loading={loading}>
            Refresh
          </Button>
        </div>

        {/* FORM */}
        <Card>
          <CardBody className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void ambil();
              }}
              className="grid gap-4 md:grid-cols-4"
            >
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Barang</label>
                <Autocomplete
                  value={nama}
                  onChange={setNama}
                  suggestions={suggestNama}
                  onPick={(v) => {
                    setNama(v);
                    const found = all.find((b) => b.nama_barang === v);
                    if (found) setLokasi(found.lokasi);
                  }}
                  placeholder="Ketik nama barang…"
                />
                {!!stokSaatIni && (
                  <div className="mt-1 text-xs text-gray-500">
                    Stok total: <b>{stokSaatIni}</b>
                  </div>
                )}
              </div>

              <Input
                label="Jumlah"
                type="number"
                min={1}
                placeholder="0"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value === "" ? "" : Number(e.target.value))}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Lokasi</label>
                {lokasiList.length ? (
                  <select
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                  >
                    <option value="">Pilih lokasi</option>
                    {lokasiList.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input placeholder="Lokasi" value={lokasi} onChange={(e) => setLokasi(e.target.value)} />
                )}
              </div>

              <div className="md:col-span-4">
                <Button type="submit" className="w-full md:w-auto" variant="primary" disabled={busy || !canSubmit} loading={busy}>
                  Catat Pengambilan
                </Button>
              </div>
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
          </CardBody>
        </Card>

        {/* HEADER RIWAYAT */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Riwayat Pengambilan</h2>
          <Button
            variant="danger"
            className="rounded-lg"
            onClick={() => setConfirmAll(true)}
            disabled={ambilOnlyHistory.length === 0}
          >
            Hapus Semua
          </Button>
        </div>

        {/* TABEL RIWAYAT */}
        <div className="surface-muted rounded-2xl p-3 border border-slate-200">
          <div className="overflow-auto rounded-xl border bg-white shadow-sm">
            <table className="table">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="th">Waktu</th>
                  <th className="th">Nama</th>
                  <th className="th">Jumlah</th>
                  <th className="th">Lokasi</th>
                  <th className="th">Aksi</th>
                  <th className="th">User</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ambilOnlyHistory.length ? (
                  ambilOnlyHistory.map((h, i) => (
                    <tr key={h.id} className={i % 2 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="td">{new Date(h.waktu).toLocaleString()}</td>
                      <td className="td">{h.nama_barang}</td>
                      <td className="td">{h.jumlah}</td>
                      <td className="td">
                        <span className="tag">{h.lokasi ?? "-"}</span>
                      </td>
                      <td className="td">{h.aksi}</td>
                      <td className="td">{h.username ?? "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="td py-10 text-center text-gray-500">
                      <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 grid place-items-center mb-2">
                        📭
                      </div>
                      Belum ada riwayat pengambilan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL HAPUS SEMUA */}
        {confirmAll && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
              <h3 className="text-lg font-semibold mb-3">Konfirmasi</h3>
              <p>
                Hapus <b>semua</b> riwayat <b>pengambilan</b>?
              </p>
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setConfirmAll(false)}>
                  Batal
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    await callBackend("/delete_history", { method: "DELETE", body: JSON.stringify({}) });
                    setConfirmAll(false);
                    await reloadAll();
                  }}
                >
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
