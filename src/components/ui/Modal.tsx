"use client";
import React, { useEffect, useRef } from "react";
import Button from "./Button";
import clsx from "clsx";

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  size = "md",
  closeOnBackdrop = true,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode; // opsional: custom tombol aksi
  size?: "sm" | "md" | "lg";
  closeOnBackdrop?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    open ? ref.current.showModal() : ref.current.close();
  }, [open]);

  // close dengan ESC ter-handle native <dialog>
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (!closeOnBackdrop) return;
    const dialog = ref.current!;
    const rect = dialog.getBoundingClientRect();
    const clickedOutside =
      e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
    if (clickedOutside) onClose();
  }

  const sizeCls = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
  }[size];

  return (
    <dialog
      ref={ref}
      className={clsx(
        "w-full rounded-2xl p-0 backdrop:bg-black/40",
        sizeCls
      )}
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            aria-label="Tutup"
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div>{children}</div>
        <div className="mt-5 flex justify-end gap-2">
          {footer ?? (
            <Button variant="ghost" onClick={onClose}>
              Tutup
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
