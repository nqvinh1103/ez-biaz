/* Shared components & helpers used by MyShopPage and OrderHistoryPage */

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const STATUS_CFG = {
  pending:   { label: "Pending",   badge: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",                    dot: "bg-[#f59e0b]" },
  shipping:  { label: "Shipping",  badge: "bg-[rgba(173,147,230,0.12)] text-[#5b3f9e] border-[#d4c6f5]",    dot: "bg-[#ad93e6]" },
  delivered: { label: "Delivered", badge: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",                   dot: "bg-[#22c55e]" },
  cancelled: { label: "Cancelled", badge: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",                   dot: "bg-[#ef4444]" },
};

export const PAYMENT_LABELS = {
  cod:   "Cash on Delivery",
  bank:  "Bank Transfer",
  card:  "Credit Card",
  vnpay: "VNPay",
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function StatCard({ label, value, sub }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-[#e6e6e6] bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">{label}</p>
      <p className="text-2xl font-bold text-[#121212]">{value}</p>
      {sub && <p className="text-xs text-[#b3b3b3]">{sub}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <svg className="h-12 w-12 text-[#e6e6e6]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
      </svg>
      <p className="text-sm text-[#737373]">{message}</p>
    </div>
  );
}
