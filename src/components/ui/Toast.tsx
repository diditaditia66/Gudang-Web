"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import clsx from "clsx";

type Toast = { id: number; msg: string; type: "success" | "error" | "info" };

const ToastCtx = createContext<{
  push: (msg: string, type?: Toast["type"]) => void;
}>({
  push: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function push(msg: string, type: Toast["type"] = "success") {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      {/* Live region untuk pembaca layar */}
      <div className="sr-only" role="status" aria-live="polite">
        {toasts.length ? toasts[toasts.length - 1].msg : ""}
      </div>

      <div className="fixed bottom-5 right-5 z-50 flex max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg",
              t.type === "success" && "bg-emerald-500",
              t.type === "error" && "bg-red-500",
              t.type === "info" && "bg-blue-600"
            )}
          >
            <div className="flex-1">{t.msg}</div>
            <button
              className="rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/60"
              onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              aria-label="Tutup notifikasi"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
