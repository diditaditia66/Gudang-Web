"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getUsername } from "@/lib/user-client";

type Barang = { nama_barang: string; jumlah: number; lokasi: string };
type History = { id: number; nama_barang: string; jumlah: number; lokasi: string | null; aksi: string; username: string | null; waktu: string };

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

  // kontrol suggestion
  const [openSuggest, setOpenSuggest] = useState(false);
  const suggestRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const u = getUsername();
    if (u) setUsername(u);
    void reloadAll();
  }, []);

  async function reloadAll() {
    setLoading(true);
    setMsgError(null);
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

  // suggest nama unik
  const suggestNama = useMemo(() => {
    const q = nama.toLowerCase().trim();
    if (!q) return [];
    return all
      .map((b) => b.nama_barang)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .filter((v) => v.toLowerCase().includes(q))
      .slice(0, 8);
  }, [all, nama]);

  // lokasi sesuai nama
  const lokasiList = useMemo(() => {
    return all
      .filter((b) => b.nama_barang === nama)
      .map((b) => b.lokasi)
      .filter((v, i, arr) => arr.indexOf(v) === i);
  }, [all, nama]);

  // stok total untuk nama
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
      const res = await fetch("/api/backend/ambil_barang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      setNama(""); setJumlah(""); setLokasi("");
      await reloadAll();
    } catch (err: any) {
      setMsgError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // hanya riwayat Ambil
  const ambilOnlyHistory = useMemo(
    () =>
      history
        .filter((h) => /ambil/i.test(h.aksi || "")) // "Ambil", "Ambil Barang", dst
        .sort((a, b) => +new Date(b.waktu) - +new Date(a.waktu)),
    [history]
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ambil Barang</h1>
          <p className="text-sm text-gray-600">
            User: <b>{username || "-"}</b>
          </p>
        </div>
        <button onClick={reloadAll} className="btn-ghost" disabled={loading}>
          {loading ? (
            <>
              <span className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Memuat…
            </>
          ) : (
            <>↻ Refresh</>
          )}
        </button>
      </div>

      {/* FORM */}
      <div className="card">
        <div className="card-body space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ambil();
            }}
            className="grid gap-4 md:grid-cols-4"
          >
            {/* NAMA + SUGGEST */}
            <div className="relative">
              <input
                className="input"
                placeholder="Nama Barang"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value);
                  setOpenSuggest(true);
                }}
                onFocus={() => setOpenSuggest(true)}
                onBlur={() => setTimeout(() => setOpenSuggest(false), 120)}
                aria-autocomplete="list"
                aria-expanded={openSuggest && suggestNama.length > 0}
              />
              {openSuggest && suggestNama.length > 0 && (
                <ul
                  ref={suggestRef}
                  className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow max-h-48 overflow-auto"
                  role="listbox"
                >
                  {suggestNama.map((s) => (
                    <li key={s} role="option">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                        // penting: pakai onMouseDown supaya tidak kalah oleh blur input
                        onMouseDown={() => {
                          setNama(s);
                          const found = all.find((b) => b.nama_barang === s);
                          if (found) setLokasi(found.lokasi);
                          setOpenSuggest(false);
                        }}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {!!stokSaatIni && (
                <div className="mt-1 text-xs text-gray-500">
                  Stok total: <b>{stokSaatIni}</b>
                </div>
              )}
            </div>

            {/* JUMLAH */}
            <input
              className="input"
              type="number"
              min={1}
              placeholder="Jumlah"
              value={jumlah}
              onChange={(e) =>
                setJumlah(e.target.value === "" ? "" : Number(e.target.value))
              }
            />

            {/* LOKASI */}
            {lokasiList.length ? (
              <select
                className="input"
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
              <input
                className="input"
                placeholder="Lokasi"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
              />
            )}

            <button type="submit" className="btn-primary w-full rounded-lg" disabled={busy || !canSubmit}>
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

      {/* HEADER RIWAYAT */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Riwayat Pengambilan</h2>
        <button
          className="btn-danger rounded-lg"
          onClick={() => setConfirmAll(true)}
          disabled={ambilOnlyHistory.length === 0}
        >
          Hapus Semua
        </button>
      </div>

      {/* TABEL RIWAYAT (permukaan berbeda) */}
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
            <p>Hapus <b>semua</b> riwayat <b>pengambilan</b>?</p>
            <div className="mt-4 flex justify-end gap-3">
              <button className="btn" onClick={() => setConfirmAll(false)}>
                Batal
              </button>
              <button
                className="btn-danger"
                onClick={async () => {
                  await fetch("/api/backend/delete_history", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}), // aman untuk backend yang mengharapkan JSON
                  });
                  setConfirmAll(false);
                  await reloadAll();
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
