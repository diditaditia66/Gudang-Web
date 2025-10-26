"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function TambahBarangPage() {
  const router = useRouter();
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlah, setJumlah] = useState<number | "">("");
  const [lokasi, setLokasi] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ambil username dari cookie "u"
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)u=([^;]+)/);
    setUsername(m ? decodeURIComponent(m[1]) : "");
  }, []);

  // validasi input
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
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Tambah Barang</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Isi data barang dengan lengkap lalu tekan <b>Simpan</b>.
          </p>
        </header>

        <form
          onSubmit={submit}
          noValidate
          className="bg-white/80 backdrop-blur-md border rounded-2xl shadow-md p-6 space-y-5 transition"
        >
          {/* Nama Barang */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Barang
            </label>
            <input
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-800/20 ${
                errors.namaBarang ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Contoh: Pompa Air"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
            />
            {errors.namaBarang && (
              <p className="text-xs text-red-600 mt-1">{errors.namaBarang}</p>
            )}
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Jumlah
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="number"
                min={1}
                className={`flex-1 rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-800/20 ${
                  errors.jumlah ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="0"
                value={jumlah}
                onChange={(e) =>
                  setJumlah(e.target.value ? Number(e.target.value) : "")
                }
              />
              <button
                type="button"
                className="btn bg-gray-100 hover:bg-gray-200 rounded-xl px-3"
                onClick={() =>
                  setJumlah((prev) =>
                    prev === "" ? 1 : Math.max(1, Number(prev) - 1)
                  )
                }
              >
                −
              </button>
              <button
                type="button"
                className="btn bg-gray-100 hover:bg-gray-200 rounded-xl px-3"
                onClick={() =>
                  setJumlah((prev) =>
                    prev === "" ? 1 : Number(prev) + 1
                  )
                }
              >
                +
              </button>
            </div>
            {errors.jumlah && (
              <p className="text-xs text-red-600 mt-1">{errors.jumlah}</p>
            )}
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Lokasi
            </label>
            <input
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-800/20 ${
                errors.lokasi ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Contoh: Rak A / Gudang Utama"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
            {errors.lokasi && (
              <p className="text-xs text-red-600 mt-1">{errors.lokasi}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3">
            <span className="text-xs text-gray-500">
              Disimpan sebagai: <b>{username || "web"}</b>
            </span>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {loading && (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              )}
              Simpan
            </button>
          </div>

          {msg && (
            <div
              className={`mt-3 rounded-lg p-3 text-sm ${
                msg.startsWith("✅")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {msg}
            </div>
          )}
        </form>

        <p className="text-xs text-gray-500 text-center">
          Semua aksi terekam di halaman <b>History</b>.
        </p>
      </div>
    </main>
  );
}
