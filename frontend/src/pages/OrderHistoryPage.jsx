import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useAuth } from "../hooks/useAuth";
import { getOrderHistory } from "../mock/mockApi";

/* ── helpers ──────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const STATUS_STYLES = {
  pending: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
  processing: "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]",
  shipped: "bg-[rgba(173,147,230,0.12)] text-[#5b3f9e] border-[#d4c6f5]",
  delivered: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
  cancelled: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
};

const STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/* ── sub-components ───────────────────────────────────────────────────── */
function StatCard({ label, value, sub }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[#e6e6e6] bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
        {label}
      </p>
      <p className="text-2xl font-bold text-[#121212]">{value}</p>
      {sub && <p className="text-xs text-[#737373]">{sub}</p>}
    </div>
  );
}

function TypeBadge({ type }) {
  return type === "sale" ? (
    <span className="inline-flex items-center rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2.5 py-0.5 text-xs font-semibold text-[#166534]">
      Sale
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-0.5 text-xs font-semibold text-[#1e40af]">
      Purchase
    </span>
  );
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function OrderRow({ order }) {
  const first = order.items[0];
  const extra = order.items.length - 1;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-[#e6e6e6] bg-white p-4 sm:flex-row sm:items-center sm:gap-4">
      {/* Image */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#e6e6e6] bg-[#f4f3f7]">
        {first?.image ? (
          <img
            src={first.image}
            alt={first.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-[#737373]">
            No img
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <TypeBadge type={order.type} />
          <span className="text-xs text-[#737373]">#{order.id}</span>
        </div>
        <p className="truncate text-sm font-semibold text-[#121212]">
          {first?.name ?? "—"}
          {extra > 0 && (
            <span className="ml-1 text-xs font-normal text-[#737373]">
              +{extra} more item{extra > 1 ? "s" : ""}
            </span>
          )}
        </p>
        <p className="text-xs text-[#737373]">{formatDate(order.createdAt)}</p>
      </div>

      {/* Status + total */}
      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
        <StatusBadge status={order.status} />
        <p className="text-base font-bold text-[#121212]">
          ${order.total?.toFixed(2) ?? "—"}
        </p>
      </div>
    </li>
  );
}

/* ── page ─────────────────────────────────────────────────────────────── */
const TABS = [
  { key: "all", label: "All" },
  { key: "purchase", label: "Purchases" },
  { key: "sale", label: "Sales" },
];

export default function OrderHistoryPage() {
  const { user, isLoggedIn } = useAuth();
  const [data, setData] = useState({ purchases: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    getOrderHistory(user.id).then((res) => {
      if (res.success) setData(res.data);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const allOrders = useMemo(
    () =>
      [...data.purchases, ...data.sales].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [data],
  );

  const filtered = useMemo(() => {
    if (tab === "all") return allOrders;
    return allOrders.filter((o) => o.type === tab);
  }, [allOrders, tab]);

  const totalSpent = useMemo(
    () => data.purchases.reduce((s, o) => s + (o.total ?? 0), 0),
    [data.purchases],
  );
  const totalRevenue = useMemo(
    () => data.sales.reduce((s, o) => s + (o.total ?? 0), 0),
    [data.sales],
  );

  /* ── not logged in ── */
  if (!isLoggedIn) {
    return (
      <PageLayout>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(173,147,230,0.1)]">
            <svg
              className="h-8 w-8 text-[#ad93e6]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#121212]">
            Sign in to view your history
          </h2>
          <p className="text-sm text-[#737373]">
            You need to be logged in to view your order history.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 md:py-14">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#121212] md:text-3xl">
              Order History
            </h1>
            <p className="mt-1 text-sm text-[#737373]">
              All your purchases and sales in one place
            </p>
          </div>
          <Link
            to="/my-listings"
            className="hidden text-sm font-medium text-[#ad93e6] hover:underline sm:block"
          >
            My Listings →
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Purchases" value={data.purchases.length} />
          <StatCard label="Total Spent" value={`$${totalSpent.toFixed(2)}`} />
          <StatCard label="Sales" value={data.sales.length} />
          <StatCard label="Revenue" value={`$${totalRevenue.toFixed(2)}`} />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-[#e6e6e6] bg-[#f4f3f7] p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-white text-[#121212] shadow-sm"
                  : "text-[#737373] hover:text-[#121212]"
              }`}
            >
              {t.label}
              <span
                className={`ml-1.5 text-xs ${tab === t.key ? "text-[#ad93e6]" : "text-[#b3b3b3]"}`}
              >
                {t.key === "all"
                  ? allOrders.length
                  : t.key === "purchase"
                    ? data.purchases.length
                    : data.sales.length}
              </span>
            </button>
          ))}
        </div>

        {/* Order list */}
        {loading ? (
          <p className="py-16 text-center text-sm text-[#737373]">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <svg
              className="h-12 w-12 text-[#e6e6e6]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
            <p className="text-sm text-[#737373]">No transactions yet.</p>
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {filtered.map((order) => (
              <OrderRow key={`${order.type}-${order.id}`} order={order} />
            ))}
          </ol>
        )}
      </div>
    </PageLayout>
  );
}
