"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TambahBarangPage() {
  const r = useRouter();
  const [nama_barang, setNama] = useState("");
  const [jumlah, setJumlah] = useState<number | "">("");
  const [lokasi, setLokasi] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)u=([^;]+)/);
    setUsername(m ? decodeURIComponent(m[1]) : "");
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const body = { nama_barang, jumlah: Number(jumlah || 0), lokasi, aksi: "Tambah Barang", username: username || "web" };
    const r2 = await fetch("/api/backend/add_barang", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r2.json().catch(() => ({}));
    if (!r2.ok) setMsg(data?.message || "Gagal menambah");
    else r.replace("/home");
  }

  return (
    <main className="container py-6">
      <h1 className="text-xl font-semibold mb-4">Tambah Barang</h1>
      <form onSubmit={submit} className="max-w-md space-y-3">
        <input className="input" placeholder="Nama Barang" value={nama_barang} onChange={(e) => setNama(e.target.value)} />
        <input className="input" placeholder="Jumlah" type="number" min={0} value={jumlah} onChange={(e) => setJumlah(e.target.value ? Number(e.target.value) : "")} />
        <input className="input" placeholder="Lokasi" value={lokasi} onChange={(e) => setLokasi(e.target.value)} />
        <button className="btn btn-primary">Simpan</button>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
      </form>
    </main>
  );
}
