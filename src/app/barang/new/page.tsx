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

  // ambil username non-HttpOnly dari cookie "u"
  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)u=([^;]+)/);
    setUsername(m ? decodeURIComponent(m[1]) : "");
  }, []);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!namaBarang.trim()) e.namaBarang = "Nama barang wajib diisi";
    if (jumlah === "" || Number.isNaN(Number(jumlah)) || Number(jumlah) <= 0) {
      e.jumlah = "Jumlah harus lebih dari 0";
    }
    if (!lokasi.trim()) e.lokasi = "Lokasi wajib diisi";
    return e;
  }, [namaBarang, jumlah, lokasi]);

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (!canSubmit || loading) return;

    try {
      setLoading(true);
      const body = {
        nama_barang: namaBarang.trim(),
        jumlah: Number(jumlah || 0),
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
      if (!r.ok) {
        setMsg(data?.message || "Gagal menambah");
        return;
      }

      // reset & pindah
      setMsg("");
      setNamaBarang("");
      setJumlah("");
      setLokasi("");
      router.replace("/home");
    } catch {
      setMsg("Kesalahan jaringan / server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tambah Barang</h1>
          <p className="text-gray-500 mt-1">Isi data barang dengan lengkap lalu simpan.</p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white border rounded-2xl shadow-sm p-6 space-y-5"
          noValidate
        >
          {/* Nama Barang */}
          <div>
            <label htmlFor="namaBarang" className="block text-sm font-medium text-gray-700">
              Nama Barang
            </label>
            <input
              id="namaBarang"
              className={`mt-1 block w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20 ${
                errors.namaBarang ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Contoh: Pompa Air"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              autoFocus
            />
            {errors.namaBarang && (
              <p className="mt-1 text-xs text-red-600">{errors.namaBarang}</p>
            )}
          </div>

          {/* Jumlah */}
          <div>
            <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">
              Jumlah
            </label>
            <div className="mt-1 flex items-stretch gap-2">
              <input
                id="jumlah"
                type="number"
                min={1}
                className={`block w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20 ${
                  errors.jumlah ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="0"
                value={jumlah}
                onChange={(e) => {
                  const v = e.target.value;
                  setJumlah(v === "" ? "" : Number(v));
                }}
                inputMode="numeric"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setJumlah((prev) => (prev === "" ? 1 : Math.max(1, Number(prev) - 1)))
                  }
                  className="px-3 rounded-xl border bg-white hover:bg-gray-50 transition"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setJumlah((prev) => (prev === "" ? 1 : Number(prev) + 1))}
                  className="px-3 rounded-xl border bg-white hover:bg-gray-50 transition"
                >
                  +
                </button>
              </div>
            </div>
            {errors.jumlah && <p className="mt-1 text-xs text-red-600">{errors.jumlah}</p>}
          </div>

          {/* Lokasi */}
          <div>
            <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700">
              Lokasi
            </label>
            <input
              id="lokasi"
              className={`mt-1 block w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/20 ${
                errors.lokasi ? "border-red-400" : "border-gray-300"
              }`}
              placeholder="Contoh: Rak A / Gudang Utama"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
            />
            {errors.lokasi && <p className="mt-1 text-xs text-red-600">{errors.lokasi}</p>}
          </div>

          {/* Footer form */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-500">
              Disimpan sebagai: <span className="font-medium text-gray-700">{username || "web"}</span>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-4 py-2 font-medium hover:bg-black transition disabled:opacity-50"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              Simpan
            </button>
          </div>

          {/* Error global */}
          {msg && (
            <div
              className="rounded-lg bg-red-50 text-red-600 text-sm p-3"
              role="alert"
              aria-live="assertive"
            >
              {msg}
            </div>
          )}
        </form>

        {/* Hint kecil */}
        <div className="mt-4 text-xs text-gray-500">
          Semua aksi akan terekam pada halaman <span className="font-medium">History</span>.
        </div>
      </div>
    </main>
  );
}
