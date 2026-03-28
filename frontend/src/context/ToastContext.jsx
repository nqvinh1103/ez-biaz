import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = "success", duration = 3000) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

/* ── Container rendered at root ─────────────────────────────────────────── */

const ICONS = {
  success: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
  error: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  ),
};

const STYLES = {
  success: "bg-[#ad93e6] text-white",
  error:   "bg-white text-[#ef4343] border border-[#fecaca]",
};

function ToastContainer({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${STYLES[t.type] ?? STYLES.success} animate-fade-in`}
        >
          {ICONS[t.type] ?? ICONS.success}
          {t.message}
        </div>
      ))}
    </div>
  );
}
