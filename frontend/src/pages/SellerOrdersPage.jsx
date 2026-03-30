import { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import { useAuth } from "../hooks/useAuth";
import { getSellerOrders, shipOrder } from "../lib/ezbiasApi";
import { formatCurrency } from "../utils/formatters";

/* ── Helpers ───────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ── Status config ─────────────────────────────────────────────────────── */
const STATUS_CFG = {
  pending:  { label: "Pending", badge: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",  dot: "bg-[#f59e0b]" },
  paid:     { label: "Paid",    badge: "bg-[#ecfeff] text-[#155e75] border-[#a5f3fc]",  dot: "bg-[#06b6d4]" },
  shipping: { label: "Shipping",    badge: "bg-[rgba(173,147,230,0.12)] text-[#5b3f9e] border-[#d4c6f5]", dot: "bg-[#ad93e6]" },
  delivered:{ label: "Delivered",      badge: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",  dot: "bg-[#22c55e]" },
  cancelled:{ label: "Cancelled",       badge: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",  dot: "bg-[#ef4444]" },
};

const PAYMENT_LABELS = {
  cod:  "Cash on Delivery",
  bank: "Bank Transfer",
  card: "Credit Card",
  vnpay:"VNPay",
};

const TABS = [
  { key: "all",       label: "All" },
  { key: "toShip",    label: "To Ship" },
  { key: "shipping",  label: "Shipping" },
  { key: "delivered", label: "Completed" },
];

/* ── Status Badge ──────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ── Order Card ────────────────────────────────────────────────────────── */
function SellerOrderCard({ order, onShip }) {
  const [loading, setLoading] = useState(false);
  const first = order.items?.[0];
  const extra = (order.items?.length ?? 1) - 1;

  const handleShip = async () => {
    if (loading) return;
    setLoading(true);
    await onShip(order.id);
    setLoading(false);
  };

  return (
    <li className="rounded-2xl border border-[#e6e6e6] bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-[#f0f0f0]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#b3b3b3]">
            Đơn #{order.id}
          </span>
          {order.buyerName && (
            <span className="text-xs text-[#737373]">Buyer: <span className="font-medium text-[#121212]">{order.buyerName}</span></span>
          )}
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-4">
        {/* Product row */}
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#e6e6e6] bg-[#f4f3f7] flex items-center justify-center">
            {first?.image ? (
              <img src={first.image} alt={first.name} className="h-full w-full object-contain p-1" />
            ) : (
              <svg className="h-6 w-6 text-[#d4d4d4]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-[#121212]">
              {first?.name ?? "—"}
              {extra > 0 && (
                <span className="ml-1 text-xs font-normal text-[#737373]">
                  +{extra} more item{extra > 1 ? "s" : ""}
                </span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#737373]">
              <span>{formatDate(order.createdAt)}</span>
              {order.payment && (
                <>
                  <span>·</span>
                  <span>{PAYMENT_LABELS[order.payment] ?? order.payment}</span>
                </>
              )}
              {order.shippingAddress && (
                <>
                  <span>·</span>
                  <span className="truncate max-w-[140px]">{order.shippingAddress}</span>
                </>
              )}
            </div>
          </div>
          <p className="shrink-0 text-base font-bold text-[#121212]">
            {formatCurrency(order.total ?? 0)}
          </p>
        </div>

        {/* Items list (if multiple) */}
        {order.items?.length > 1 && (
          <ul className="flex flex-col gap-1 rounded-lg bg-[#fafafa] px-3 py-2">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-xs text-[#737373]">
                <span className="truncate">{item.name} × {item.qty ?? 1}</span>
                <span className="font-medium text-[#121212]">{formatCurrency(item.price * (item.qty ?? 1))}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Action: seller ships */}
        {(order.status === "pending" || order.status === "paid") && (
          <button
            onClick={handleShip}
            disabled={loading}
            className="w-full rounded-lg bg-[#ad93e6] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9d7ed9] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                Confirm Shipment
              </>
            )}
          </button>
        )}

        {/* Shipped state info */}
        {order.status === "shipping" && (
          <div className="flex items-center gap-2 rounded-lg bg-[rgba(173,147,230,0.08)] border border-[#d4c6f5] px-3 py-2 text-xs text-[#5b3f9e]">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            Shipped — waiting for buyer to confirm receipt
          </div>
        )}

        {/* Received state info */}
        {order.status === "delivered" && (
          <div className="flex items-center gap-2 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-2 text-xs text-[#166534]">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Buyer confirmed receipt
          </div>
        )}
      </div>
    </li>
  );
}

/* ── Stat Card ─────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-[#e6e6e6] bg-white px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">{label}</p>
      <p className="text-2xl font-bold text-[#121212]">{value}</p>
      {sub && <p className="text-xs text-[#b3b3b3]">{sub}</p>}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function SellerOrdersPage() {
  const { user, isLoggedIn } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("all");

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    let mounted = true;
    getSellerOrders(user.id).then((res) => {
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

  const handleShip = async (orderId) => {
    const res = await shipOrder(orderId, user.id);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: "shipping" } : o)
      );
    }
  };

  const filtered = useMemo(() => {
    if (tab === "all") return orders;
    if (tab === "toShip") return orders.filter((o) => o.status === "pending" || o.status === "paid");
    return orders.filter((o) => o.status === tab);
  }, [orders, tab]);

  const pendingCount  = orders.filter((o) => o.status === "pending" || o.status === "paid").length;
  const receivedCount = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue  = orders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + (o.total ?? 0), 0);

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
          <h2 className="text-lg font-bold text-[#121212]">Sign in to manage orders</h2>
          <p className="text-sm text-[#737373]">You need to be logged in to view your shop orders.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[860px] px-4 py-10 md:py-14">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#121212] md:text-3xl">Seller Orders</h1>
          <p className="mt-1 text-sm text-[#737373]">Confirm and manage your shop orders</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Orders"  value={orders.length} />
          <StatCard label="To Ship"       value={pendingCount}  sub={pendingCount > 0 ? "Needs action" : "All done!"} />
          <StatCard label="Completed"     value={receivedCount} />
          <StatCard label="Revenue"       value={formatCurrency(totalRevenue)} sub="From delivered orders" />
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-1">
          {TABS.map((t) => {
            const count = t.key === "all"
              ? orders.length
              : orders.filter((o) => o.status === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                  tab === t.key
                    ? "bg-white text-[#121212] shadow-sm"
                    : "text-[#737373] hover:text-[#121212]"
                }`}
              >
                {t.label}
                {count > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                    tab === t.key ? "bg-[#ad93e6] text-white" : "bg-[#e6e6e6] text-[#737373]"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Alert: pending orders need action */}
        {pendingCount > 0 && tab !== "shipped" && tab !== "received" && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            You have <span className="font-bold mx-1">{pendingCount}</span> order{pendingCount > 1 ? "s" : ""} waiting to be shipped.
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <svg className="h-12 w-12 text-[#e6e6e6]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="text-sm text-[#737373]">No orders found.</p>
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {filtered.map((order) => (
              <SellerOrderCard key={order.id} order={order} onShip={handleShip} />
            ))}
          </ol>
        )}
      </div>
    </PageLayout>
  );
}
