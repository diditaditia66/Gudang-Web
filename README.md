# Gudang Web (Next.js)

Frontend React (Next.js App Router) yang menyesuaikan endpoint Flask yang sudah ada:

- `POST /login` — login
- `GET /get_barang` — list/autocomplete barang
- `POST /add_barang` — tambah barang (`aksi: "Tambah Barang"`)
- `POST /update_barang` — ambil barang (kurangi stok)
- `DELETE /delete_barang` — hapus barang (by nama_barang + lokasi)
- `GET /get_history` — daftar riwayat
- `DELETE /delete_history` — hapus riwayat (opsional `id`)

## Jalankan Lokal
```bash
cp .env.example .env.local
# set NEXT_PUBLIC_API_BASE_URL ke URL server Flask
npm i
npm run dev
```

## Deploy ke AWS Amplify
- Hubungkan repo, set env `NEXT_PUBLIC_API_BASE_URL`.
- Build: `npm run build`.
