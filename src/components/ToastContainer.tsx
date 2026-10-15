import { useState, useEffect } from "react";
import { onToast, type ToastItem } from "@/lib/toast";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const COLORS = {
  success: "bg-[#0F172A]",
  info:    "bg-[#0F172A]",
  warning: "bg-[#0F172A]",
  error:   "bg-red-600",
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return onToast((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 4500);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl text-white text-sm leading-snug ${COLORS[t.type]} animate-in slide-in-from-bottom-3 fade-in duration-200`}
          >
            <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{t.msg}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
