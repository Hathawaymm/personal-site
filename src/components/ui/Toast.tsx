"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";

type ToastType = "success" | "warning" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const typeStyles: Record<ToastType, string> = {
  success: "border-accent-sage/40 bg-accent-sage/5 text-accent-sage",
  warning: "border-accent-gold/40 bg-accent-gold/5 text-accent-gold",
  error: "border-accent-rose/40 bg-accent-rose/5 text-accent-rose",
  info: "border-accent-sky/40 bg-accent-sky/5 text-accent-sky",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => { timers.forEach(clearTimeout); };
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setItems(prev => [...prev, { id, message, type }]);
    const timer = setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
      timersRef.current = timersRef.current.filter(t => t !== timer);
    }, 2000);
    timersRef.current.push(timer);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-20 right-6 z-[100] flex flex-col gap-2">
        {items.map(item => (
          <div
            key={item.id}
            className={`rounded-lg border px-4 py-2.5 text-sm shadow-paper animate-in slide-in-from-right ${typeStyles[item.type]}`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
