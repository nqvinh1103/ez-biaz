import { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import { formatDate, STATUS_CFG, StatusBadge, StatCard, PAYMENT_LABELS } from "../components/shared/OrderShared";
import { useAuth } from "../hooks/useAuth";
import { getOrders, receiveOrder } from "../lib/ezbiasApi";
import { formatCurrency } from "../utils/formatters";

const FLOW_STEPS = ["pending", "shipping", "delivered"];

const TABS = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "shipping",  label: "Shipping" },
  { key: "delivered", label: "Delivered" },
];

/* ── Progress bar for the 3-step flow ─────────────────────────────────── */
function OrderProgress({ status }) {
  const idx = FLOW_STEPS.indexOf(status);
  if (idx === -1 || status === "cancelled") return null;

  return (
    <div className="flex items-center gap-0 mt-3">
      {FLOW_STEPS.map((step, i) => {
        const done    = i <= idx;
        const current = i === idx;
        const cfg = STATUS_CFG[step];
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                done
                  ? "border-[#ad93e6] bg-[#ad93e6]"
                  : "border-[#e6e6e6] bg-white"
              }`}>
                {done && (
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap ${done ? "text-[#5b3f9e]" : "text-[#b3b3b3]"}`}>
                {cfg.label}
              </span>
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 transition-colors ${i < idx ? "bg-[#ad93e6]" : "bg-[#e6e6e6]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Order Card ────────────────────────────────────────────────────────── */
function OrderCard({ order, onReceived }) {
  const [loading, setLoading] = useState(false);
  const first = order.items?.[0];
  const extra = (order.items?.length ?? 1) - 1;

  const handleReceive = async () => {
    if (loading) return;
    setLoading(true);
    await onReceived(order.id);
    setLoading(false);
  };

  return (
    <li className="rounded-2xl border border-[#e6e6e6] bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-[#f0f0f0]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#b3b3b3]">
          Đơn #{order.id}
        </span>
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
            </div>
          </div>
          <p className="shrink-0 text-base font-bold text-[#121212]">
            {formatCurrency(order.total ?? 0)}
          </p>
        </div>

        {/* Progress */}
        <OrderProgress status={order.status} />

        {/* Action: buyer confirms received */}
        {order.status === "shipping" && (
          <button
            onClick={handleReceive}
            disabled={loading}
            className="mt-1 w-full rounded-lg bg-[#ad93e6] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#9d7ed9] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Mark as Received
              </>
            )}
          </button>
        )}
      </div>
    </li>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function OrderHistoryPage() {
  const { user, isLoggedIn } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("all");

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

  const handleReceived = async (orderId) => {
    const res = await receiveOrder(orderId, user.id);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => o.id === orderId ? { ...o, status: "delivered" } : o)
      );
    }
  };

  const filtered = useMemo(() =>
    tab === "all" ? orders : orders.filter((o) => o.status === tab),
    [orders, tab]
  );

  const totalSpent = useMemo(
    () => orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + (o.total ?? 0), 0),
    [orders],
  );

  const pendingCount  = orders.filter((o) => o.status === "pending").length;
  const shippingCount = orders.filter((o) => o.status === "shipping").length;

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
          <h2 className="text-lg font-bold text-[#121212]">Sign in to view your orders</h2>
          <p className="text-sm text-[#737373]">You need to be logged in to view your order history.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[860px] px-4 py-10 md:py-14">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#121212] md:text-3xl">My Orders</h1>
          <p className="mt-1 text-sm text-[#737373]">Track and confirm your orders</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Orders" value={orders.length} />
          <StatCard label="Pending"      value={pendingCount}  sub={pendingCount > 0 ? "Awaiting seller" : "None"} />
          <StatCard label="Shipping"     value={shippingCount} sub={shippingCount > 0 ? "Needs confirmation" : "None"} />
          <StatCard label="Total Spent"  value={formatCurrency(totalSpent)} />
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

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <svg className="h-12 w-12 text-[#e6e6e6]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
            <p className="text-sm text-[#737373]">No orders found.</p>
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} onReceived={handleReceived} />
            ))}
          </ol>
        )}
      </div>
    </PageLayout>
  );
}
