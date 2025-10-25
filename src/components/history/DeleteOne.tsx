"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export default function DeleteOne({ id }: { id: number }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  async function del() {
    await fetch(`${API}/delete_history`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <button className="btn" disabled={pending} onClick={() => start(del)}>
      {pending ? "Menghapus..." : "Hapus"}
    </button>
  );
}
