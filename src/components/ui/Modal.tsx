"use client";
import React, { useEffect, useRef } from "react";

export default function Modal({
  open, title, children, onClose
}: { open: boolean; title: string; children: React.ReactNode; onClose: () => void; }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (!ref.current) return;
    open ? ref.current.showModal() : ref.current.close();
  }, [open]);
  return (
    <dialog ref={ref} className="rounded-2xl p-0 w-full max-w-md backdrop:bg-black/30" onClose={onClose}>
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div>{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </dialog>
  );
}
