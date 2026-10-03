import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { Toast } from "@/lib/toastTypes";

interface ToastContextValue {
  toasts: Toast[];
  showToast: (type: Toast["type"], message: string) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: Toast["type"], message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismissToast(id), 5000);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, dismissToast }: { toasts: Toast[]; dismissToast: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const colors: Record<Toast["type"], string> = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };
  return (
    <div
      className={`${colors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 animate-fade-in`}
    >
      <span className="text-sm">{toast.message}</span>
      <button onClick={onDismiss} className="text-white/80 hover:text-white text-sm">✕</button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
