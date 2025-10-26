// src/app/list/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

type Row = { nama_barang: string; jumlah: number; lokasi: string; };

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

  const debounceRef = useRef<number | null>(null);

  useEffect(() => { void load(); }, []);
  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch("/api/backend/get_barang", { cache: "no-store" });
      if (!r.ok) throw new Error("Gagal memuat");
      const data: Row[] = await r.json();
      setRows(data);
    } catch (e: any) {
      setMsg(e?.message || "Gagal memuat");
    } finally {
      setLoading(false);
    }
  }

  function onSearchChange(v: string) {
    setQ(v);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      // saat ini pencarian hanya client-side (filter array)
      // jika nanti ingin server-side query, panggil API di sini.
    }, 250);
  }

  function onSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const view = useMemo(() => {
    const s = q.toLowerCase().trim();
    let filtered = !s
      ? rows
      : rows.filter(b => (b.nama_barang || "").toLowerCase().includes(s) || (b.lokasi || "").toLowerCase().includes(s));

    const sorted = [...filtered].sort((a, b) => {
      const va = (a as any)[sortKey];
      const vb = (b as any)[sortKey];
      if (sortKey === "jumlah") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const A = String(va ?? "").toLowerCase();
      const B = String(vb ?? "").toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [rows, q, sortKey, sortDir]);

  async function remove(nama: string, lokasi: string) {
    setMsg(null);
    const r = await fetch("/api/backend/delete_barang", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama_barang: nama, lokasi })
    });
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setMsg(d?.message || "Gagal menghapus barang");
    }
    setConfirm({ open: false });
    await load();
  }

  function Th({
    label, k,
  }: { label: string; k: SortKey }) {
    const active = sortKey === k;
    return (
      <th className="th select-none">
        <button
          type="button"
          onClick={() => onSort(k)}
          className={`inline-flex items-center gap-1 hover:underline ${active ? "text-gray-900" : "text-gray-600"}`}
        >
          {label}
          <span className="text-xs">{active ? (sortDir === "asc" ? "▲" : "▼") : ""}</span>
        </button>
      </th>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">List Barang</h1>
        <Button onClick={() => load()} disabled={loading} variant="secondary">
          {loading ? "Memuat..." : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="Cari nama / lokasi" value={q} onChange={(e) => onSearchChange(e.target.value)} />
          </div>
          {msg && <div className="mt-3 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{msg}</div>}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="overflow-auto rounded-xl border">
            <table className="table">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <Th label="Nama" k="nama_barang" />
                  <Th label="Jumlah" k="jumlah" />
                  <Th label="Lokasi" k="lokasi" />
                  <th className="th w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {view.map((b, i) => (
                  <tr key={`${b.nama_barang}-${b.lokasi}-${i}`} className={i % 2 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="td">{b.nama_barang}</td>
                    <td className="td">{b.jumlah}</td>
                    <td className="td"><span className="tag">{b.lokasi}</span></td>
                    <td className="td">
                      <Button
                        variant="secondary"
                        onClick={() => setConfirm({ open: true, nama: b.nama_barang, lokasi: b.lokasi })}
                        disabled={loading}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}

                {!loading && view.length === 0 && (
                  <tr>
                    <td className="td py-10 text-center text-gray-500" colSpan={4}>
                      <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 grid place-items-center mb-2">🔎</div>
                      Tidak ada data yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <Modal open={confirm.open} onClose={() => setConfirm({ open: false })} title="Konfirmasi Hapus">
        <p>
          Hapus barang <b>{confirm.nama}</b> di lokasi <b>{confirm.lokasi}</b>?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={() => setConfirm({ open: false })}>Batal</button>
          <button className="btn btn-primary" onClick={() => remove(confirm.nama!, confirm.lokasi!)}>Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
