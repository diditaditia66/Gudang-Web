"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export default function DeleteAll() {
  const [pending, start] = useTransition();
  const router = useRouter();

  async function delAll() {
    await fetch(`${API}/delete_history`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // hapus semua
    });
    router.refresh();
  }

  return (
    <button className="btn" onClick={() => start(delAll)} disabled={pending}>
      {pending ? "Menghapus..." : "Hapus Semua History"}
    </button>
  );
}
