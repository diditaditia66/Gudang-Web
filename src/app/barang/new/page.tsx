"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";

export default function TambahBarangPage() {
  const router = useRouter();
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlah, setJumlah] = useState<number | "">("");
  const [lokasi, setLokasi] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)u=([^;]+)/);
    setUsername(m ? decodeURIComponent(m[1]) : "");
  }, []);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!namaBarang.trim()) e.namaBarang = "Nama barang wajib diisi";
    if (jumlah === "" || Number(jumlah) <= 0) e.jumlah = "Jumlah harus lebih dari 0";
    if (!lokasi.trim()) e.lokasi = "Lokasi wajib diisi";
    return e;
  }, [namaBarang, jumlah, lokasi]);

  const canSubmit = Object.keys(errors).length === 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setMsg("");
    setLoading(true);

    try {
      const body = {
        nama_barang: namaBarang.trim(),
        jumlah: Number(jumlah),
        lokasi: lokasi.trim(),
        aksi: "Tambah Barang",
        username: username || "web",
      };

      const r = await fetch("/api/backend/add_barang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.message || "Gagal menambah barang");

      setMsg("✅ Barang berhasil ditambahkan!");
      setNamaBarang("");
      setJumlah("");
      setLokasi("");
      setTimeout(() => router.replace("/home"), 1000);
    } catch (err: any) {
      setMsg(err.message || "Kesalahan jaringan / server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="max-w-xl mx-auto space-y-6">
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle>Tambah Barang</CardTitle>
            <CardDescription>Isi data barang dengan lengkap lalu tekan <b>Simpan</b>.</CardDescription>
          </CardHeader>
          <CardBody>
            <form onSubmit={submit} noValidate className="space-y-5">
              <Input
                label="Nama Barang"
                placeholder="Contoh: Pompa Air"
                value={namaBarang}
                onChange={(e) => setNamaBarang(e.target.value)}
                error={errors.namaBarang}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="0"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value ? Number(e.target.value) : "")}
                    error={errors.jumlah}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" onClick={() => setJumlah((prev) => (prev === "" ? 1 : Math.max(1, Number(prev) - 1)))}>
                    −
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setJumlah((prev) => (prev === "" ? 1 : Number(prev) + 1))}>
                    +
                  </Button>
                </div>
                {errors.jumlah && <p className="text-xs text-red-600 mt-1">{errors.jumlah}</p>}
              </div>

              <Input
                label="Lokasi"
                placeholder="Contoh: Rak A / Gudang Utama"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                error={errors.lokasi}
              />

              <CardFooter className="!p-0 pt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Disimpan sebagai: <b>{username || "web"}</b>
                </span>
                <Button type="submit" variant="primary" loading={loading} disabled={!canSubmit || loading}>
                  Simpan
                </Button>
              </CardFooter>

              {msg && (
                <div
                  className={`mt-3 rounded-lg p-3 text-sm ${
                    msg.startsWith("✅")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                  role="status"
                >
                  {msg}
                </div>
              )}
            </form>
          </CardBody>
        </Card>

        <p className="text-xs text-gray-500 text-center">
          Semua aksi terekam di halaman <b>History</b>.
        </p>
      </div>
    </main>
  );
}
