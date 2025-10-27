"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { Card, CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { callBackend } from "@/lib/call-backend";

type Row = { nama_barang: string; jumlah: number; lokasi: string };
type SortKey = "nama_barang" | "jumlah" | "lokasi";
type SortDir = "asc" | "desc";

export default function ListPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<{ open: boolean; nama?: string; lokasi?: string }>({ open: false });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("nama_barang");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [page, setPage] = useState(1);
  const perPage = 10;
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await callBackend("/api/backend/get_barang");
      if (!r.ok) throw new Error("Gagal memuat data");
      const data: Row[] = await r.json();
      setRows(data);
    } catch (e: any) {
      setMsg(e?.message || "Kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }

  function onSearchChange(v: string) {
    setQ(v);
    setPage(1);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {}, 250);
  }

  function onSort(key: SortKey) {
    if (key === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return !s
      ? rows
      : rows.filter(
          (b) =>
            (b.nama_barang || "").toLowerCase().includes(s) ||
            (b.lokasi || "").toLowerCase().includes(s)
        );
  }, [rows, q]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    data.sort((a, b) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      if (sortKey === "jumlah") return sortDir === "asc" ? va - vb : vb - va;
      const A = String(va ?? "").toLowerCase();
      const B = String(vb ?? "").toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const currentData = sorted.slice((page - 1) * perPage, page * perPage);

  async function remove(nama: string, lokasi: string) {
    setMsg(null);
    try {
      const r = await callBackend("/api/backend/delete_barang", {
        method: "POST", // ganti dari DELETE -> POST
        body: JSON.stringify({ nama_barang: nama, lokasi }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d?.message || "Gagal menghapus barang");
      }
      await load();
      setMsg("✅ Barang berhasil dihapus");
    } catch (err: any) {
      setMsg(err.message || "Kesalahan jaringan / server");
    } finally {
      setConfirm({ open: false });
    }
  }

  function Th({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th className="th select-none whitespace-nowrap">
        <button
          type="button"
          onClick={() => onSort(k)}
          className={`inline-flex items-center gap-1 hover:underline ${
            active ? "text-gray-900 font-semibold" : "text-gray-600"
          }`}
          aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
        >
          {label}
          {active && <span className="text-xs">{sortDir === "asc" ? "▲" : "▼"}</span>}
        </button>
      </th>
    );
  }

  function toCsvValue(v: unknown) {
    const s = String(v ?? "");
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function exportCsv() {
    const data = sorted;
    const header = ["nama_barang", "jumlah", "lokasi"];
    const lines = [
      header.join(","),
      ...data.map((r) => [toCsvValue(r.nama_barang), toCsvValue(r.jumlah), toCsvValue(r.lokasi)].join(",")),
    ];
    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const ts = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fname = `stok-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(
      ts.getHours()
    )}${pad(ts.getMinutes())}${pad(ts.getSeconds())}.csv`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <RequireAuth>
      <main className="animate-fadeIn grid gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Daftar Barang</h1>
          <div className="flex gap-2">
            <Button onClick={exportCsv} variant="secondary" disabled={loading || sorted.length === 0}>
              Export CSV
            </Button>
            <Button onClick={() => load()} disabled={loading} variant="secondary" loading={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Pencarian */}
        <Card>
          <CardBody>
            <div className="grid md:grid-cols-3 gap-3">
              <Input
                placeholder="Cari berdasarkan nama atau lokasi"
                value={q}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label="Pencarian barang"
              />
            </div>
            {msg && (
              <div
                className={`mt-3 rounded-lg border p-3 text-sm ${
                  msg.startsWith("✅")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
                role="status"
              >
                {msg}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Tabel Barang */}
        <Card>
          <CardBody>
            <div className="overflow-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="table min-w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <Th label="Nama Barang" k="nama_barang" />
                    <Th label="Jumlah" k="jumlah" />
                    <Th label="Lokasi" k="lokasi" />
                    <th className="th text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-gray-500 text-sm">
                        <div className="mx-auto w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                        Memuat data...
                      </td>
                    </tr>
                  ) : currentData.length > 0 ? (
                    currentData.map((b, i) => (
                      <tr key={`${b.nama_barang}-${b.lokasi}-${i}`} className="hover:bg-gray-50 transition">
                        <td className="td font-medium text-gray-900">{b.nama_barang}</td>
                        <td className="td">{b.jumlah}</td>
                        <td className="td">
                          <span className="tag">{b.lokasi}</span>
                        </td>
                        <td className="td text-center">
                          <Button
                            variant="secondary"
                            onClick={() => setConfirm({ open: true, nama: b.nama_barang, lokasi: b.lokasi })}
                            disabled={loading}
                          >
                            Hapus
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="td py-10 text-center text-gray-500" colSpan={4}>
                        <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 grid place-items-center mb-2">📦</div>
                        Tidak ada data ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && sorted.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3 text-sm text-gray-600">
                <div>
                  Menampilkan{" "}
                  <b>
                    {Math.min((page - 1) * perPage + 1, sorted.length)}–{Math.min(page * perPage, sorted.length)}
                  </b>{" "}
                  dari <b>{sorted.length}</b> barang
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-label="Halaman sebelumnya"
                  >
                    ← Sebelumnya
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-label="Halaman berikutnya"
                  >
                    Berikutnya →
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Modal Konfirmasi */}
        <Modal
          open={confirm.open}
          onClose={() => setConfirm({ open: false })}
          title="Konfirmasi Hapus"
        >
          <p className="text-gray-700">
            Apakah Anda yakin ingin menghapus barang <b>{confirm.nama}</b> di lokasi <b>{confirm.lokasi}</b>?
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirm({ open: false })}>Batal</Button>
            <Button variant="danger" onClick={() => remove(confirm.nama!, confirm.lokasi!)}>Hapus</Button>
          </div>
        </Modal>
      </main>
    </RequireAuth>
  );
}
