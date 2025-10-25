// src/app/page.tsx
// (TIDAK ADA "use client" di file ini)
import DeleteButton from "@/components/DeleteButton";

// ...kode server component kamu (fetch data, render tabel, dll)

function ActionsCell({ nama_barang, lokasi }: { nama_barang: string; lokasi: string }) {
  // Komponen kecil server yang merender komponen client
  return <DeleteButton nama_barang={nama_barang} lokasi={lokasi} onDone={() => { /* optional: trigger refresh via router.refresh() di client lain */ }} />;
}

export default async function Page() {
  // contoh: const data = await getBarang();
  // render <ActionsCell nama_barang={...} lokasi={...} />
  // ...
}
