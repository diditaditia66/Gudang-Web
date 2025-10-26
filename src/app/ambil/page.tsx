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
  useEffect(() => { const u = getUsername(); if (u) setUsername(u); }, []);

  const [nama, setNama] = useState("");
  const [jumlah, setJumlah] = useState<number | "">("");
  const [lokasi, setLokasi] = useState("");
  const [all, setAll] = useState<Barang[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [confirmAll, setConfirmAll] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { loadBarang(); loadHistory(); }, []);

  async function loadBarang() {
    const r = await fetch("/api/backend/get_barang", { cache: "no-store" });
    if (r.ok) setAll(await r.json()); else setAll([]);
  }
  async function loadHistory() {
    const r = await fetch("/api/backend/get_history", { cache: "no-store" });
    if (r.ok) setHistory(await r.json()); else setHistory([]);
  }

  const suggestNama = useMemo(() => {
    const q = nama.toLowerCase(); if (!q) return [];
    return all.filter(b => b.nama_barang.toLowerCase().includes(q)).slice(0, 5).map(b => b.nama_barang);
  }, [all, nama]);

  function pickNama(v: string) {
    setNama(v);
    const found = all.find(b => b.nama_barang === v);
    if (found) setLokasi(found.lokasi);
  }

  const canSubmit = nama && lokasi && jumlah !== "" && Number(jumlah) > 0;

  async function ambil() {
    setMsg(null);
    const res = await fetch("/api/backend/ambil_barang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama_barang: nama, jumlah: Number(jumlah), lokasi, aksi: "Ambil Barang", username })
    });
    if (res.ok) {
      setNama(""); setJumlah(""); setLokasi("");
      await loadBarang(); await loadHistory();
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(data?.message || "Gagal ambil barang");
    }
  }

  async function hapusHistory(id?: number) {
    await fetch("/api/backend/delete_history", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : {})
    });
    setConfirmAll(false);
    await loadHistory();
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">Ambil Barang</h1>
      <div className="text-sm text-gray-600">User: <b>{username || "-"}</b></div>

      <Card><CardBody>
        <form className="grid md:grid-cols-4 gap-3" onSubmit={e => { e.preventDefault(); if (canSubmit) void ambil(); }}>
          <Autocomplete value={nama} onChange={setNama} suggestions={suggestNama} onPick={pickNama} placeholder="Nama Barang" />
          <Input type="number" placeholder="Jumlah diambil" value={jumlah} onChange={(e) => setJumlah(e.target.value === "" ? "" : Number(e.target.value))} />
          <Input placeholder="Lokasi" value={lokasi} onChange={(e) => setLokasi(e.target.value)} />
          <Button className="w-full" variant="primary" disabled={!canSubmit}>Ambil</Button>
        </form>
        {msg && <p className="text-sm text-red-600 mt-2">{msg}</p>}
      </CardBody></Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">History</h2>
        <Button onClick={() => setConfirmAll(true)}>Hapus Semua History</Button>
      </div>

      <Card><CardBody>
        <div className="overflow-auto rounded-xl border">
          <table className="table">
            <thead><tr>
              <th className="th">Waktu</th><th className="th">Nama</th><th className="th">Jumlah</th>
              <th className="th">Lokasi</th><th className="th">Aksi</th><th className="th">User</th><th className="th w-24">Hapus</th>
            </tr></thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td className="td">{new Date(h.waktu).toLocaleString()}</td>
                  <td className="td">{h.nama_barang}</td>
                  <td className="td">{h.jumlah}</td>
                  <td className="td"><span className="tag">{h.lokasi}</span></td>
                  <td className="td">{h.aksi}</td>
                  <td className="td">{h.username}</td>
                  <td className="td"><Button onClick={() => hapusHistory(h.id)}>Hapus</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody></Card>

      <Modal open={confirmAll} onClose={() => setConfirmAll(false)} title="Konfirmasi">
        <p>Hapus semua history?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={() => setConfirmAll(false)}>Batal</button>
          <button className="btn btn-primary" onClick={() => hapusHistory(undefined)}>Hapus</button>
        </div>
      </Modal>
    </div>
  );
}
