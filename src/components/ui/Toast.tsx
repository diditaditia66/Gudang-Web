"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Toast = { id: number; msg: string; type: "success" | "error" };
const ToastCtx = createContext<{ push: (msg: string, type?: "success" | "error") => void }>({
  push: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function push(msg: string, type: "success" | "error" = "success") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-lg shadow text-white text-sm ${
              t.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
