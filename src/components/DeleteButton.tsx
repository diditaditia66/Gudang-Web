"use client";

import { useTransition } from "react";

type Props = {
  nama_barang: string;
  lokasi: string;
  onDone?: () => void; // panggil ulang data setelah hapus
};

export default function DeleteButton({ nama_barang, lokasi, onDone }: Props) {
  const [pending, start] = useTransition();

  async function doDelete() {
    await fetch("/api/backend/delete_barang", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama_barang, lokasi }),
    });
    onDone?.();
  }

  return (
    <button
      className="btn"
      disabled={pending}
      onClick={() => start(() => doDelete())}
      title="Hapus barang"
    >
      {pending ? "Menghapus..." : "Hapus"}
    </button>
  );
}
