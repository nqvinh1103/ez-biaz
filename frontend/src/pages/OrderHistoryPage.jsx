import { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import { useAuth } from "../hooks/useAuth";
import { getOrders } from "../lib/ezbiasApi";

/* ── Helpers ──────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES = {
  pending:    "bg-[#fffbeb]  text-[#92400e] border-[#fde68a]",
  processing: "bg-[#eff6ff]  text-[#1e40af] border-[#bfdbfe]",
  shipped:    "bg-[rgba(173,147,230,0.12)] text-[#5b3f9e] border-[#d4c6f5]",
  delivered:  "bg-[#f0fdf4]  text-[#166534] border-[#bbf7d0]",
  cancelled:  "bg-[#fef2f2]  text-[#991b1b] border-[#fecaca]",
};

const STATUS_LABELS = {
  pending:    "Pending",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

const PAYMENT_LABELS = {
  cod:  "Cash on Delivery",
  bank: "Bank Transfer",
};

/* ── Sub-components ───────────────────────────────────────────────────── */
function StatCard({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[#e6e6e6] bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">{label}</p>
      <p className="text-2xl font-bold text-[#121212]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls   = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

function OrderRow({ order }) {
  const first = order.items?.[0];
  const extra = (order.items?.length ?? 1) - 1;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-[#e6e6e6] bg-white p-4 sm:flex-row sm:items-center sm:gap-4">
      {/* Thumbnail */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#e6e6e6] bg-[#f4f3f7] flex items-center justify-center">
        {first?.image ? (
          <img src={first.image} alt={first.name} className="h-full w-full object-contain p-1" />
        ) : (
          <svg className="h-6 w-6 text-[#d4d4d4]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#b3b3b3]">
          #{order.id}
        </span>
        <p className="truncate text-sm font-semibold text-[#121212]">
          {first?.name ?? "—"}
          {extra > 0 && (
            <span className="ml-1 text-xs font-normal text-[#737373]">
              +{extra} more item{extra > 1 ? "s" : ""}
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#737373]">
          <span>{formatDate(order.createdAt)}</span>
          {order.payment && (
            <>
              <span>·</span>
              <span>{PAYMENT_LABELS[order.payment] ?? order.payment}</span>
            </>
          )}
        </div>
      </div>

      {/* Status + total */}
      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
        <StatusBadge status={order.status} />
        <p className="text-base font-bold text-[#121212]">
          ${Number(order.total ?? 0).toFixed(2)}
        </p>
      </div>
    </li>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function OrderHistoryPage() {
  const { user, isLoggedIn } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    let mounted = true;
    getOrders(user.id).then((res) => {
      if (!mounted) return;
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : [];
        setOrders(list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const totalSpent = useMemo(
    () => orders.reduce((s, o) => s + (o.total ?? 0), 0),
    [orders],
  );

  /* ── Not logged in ── */
  if (!isLoggedIn) {
    return (
      <PageLayout>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(173,147,230,0.1)]">
            <svg className="h-8 w-8 text-[#ad93e6]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#121212]">Sign in to view your history</h2>
          <p className="text-sm text-[#737373]">You need to be logged in to view your order history.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 md:py-14">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#121212] md:text-3xl">Order History</h1>
          <p className="mt-1 text-sm text-[#737373]">All your purchases in one place</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          <StatCard label="Total Orders" value={orders.length} />
          <StatCard label="Total Spent"  value={`$${totalSpent.toFixed(2)}`} />
        </div>

        {/* Order list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <svg className="h-12 w-12 text-[#e6e6e6]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
            <p className="text-sm text-[#737373]">No orders yet.</p>
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </ol>
        )}
      </div>
    </PageLayout>
  );
}
