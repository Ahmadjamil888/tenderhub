/**
 * Lightweight global toast — no external dependencies.
 * Uses a simple event emitter so any component can fire a toast.
 */

export type ToastItem = {
  id: number;
  msg: string;
  type: "success" | "info" | "warning" | "error";
};

type Listener = (toast: ToastItem) => void;
const listeners: Listener[] = [];

let counter = 0;

export function toast(
  msg: string,
  type: ToastItem["type"] = "info"
) {
  const item: ToastItem = { id: ++counter, msg, type };
  listeners.forEach((l) => l(item));
}

export function onToast(listener: Listener) {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}
