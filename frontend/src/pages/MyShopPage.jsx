import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import {
  EmptyState,
  PAYMENT_LABELS,
  Spinner,
  StatCard,
  StatusBadge,
  formatDate,
} from "../components/shared/OrderShared";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { useAuth } from "../hooks/useAuth";
import {
  createProductBoostPayment,
  deleteListing,
  getListingsByUser,
  getSellerOrders,
  getSoldItems,
  shipOrder,
  updateListing,
} from "../lib/ezbiasApi";
import { formatCurrency } from "../utils/formatters";

/* ════════════════════════════════════════════════════
   LISTINGS TAB — components
   ════════════════════════════════════════════════════ */
const CONDITIONS = ["Brand New", "Like New", "Good", "Fair", "Poor"];
const STOCK_FILTERS = ["All", "In Stock", "Low Stock", "Out of Stock"];

function stockBadge(stock) {
  if (stock === 0) return { label: "Out of Stock", variant: "urgent" };
  if (stock <= 3) return { label: "Low Stock", variant: "live" };
  return { label: "In Stock", variant: "default" };
}

function EditModal({ listing, onClose, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: listing.name,
    description: listing.description ?? "",
    condition: listing.condition,
    price: String(listing.price),
    stock: String(listing.stock),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await updateListing(user.id, listing.id, {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
    });
    setSaving(false);
    if (res.success) onSaved(res.data);
    else setError(res.message);
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/45 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e6e6e6] px-6 py-4">
          <h2 className="text-base font-bold text-[#121212]">Edit Listing</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-[#737373] hover:bg-[#f0f0f0]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-4 px-6 py-5">
          <FormField label="Product Name" id="edit-name" name="name" value={form.name} onChange={handleChange} />
          <FormField label="Description" id="edit-desc" name="description" as="textarea" rows={3} value={form.description} onChange={handleChange} />
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <FormField label="Condition" id="edit-cond" name="condition" as="select" value={form.condition} onChange={handleChange}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </FormField>
              <svg className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-[#737373]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
              </svg>
            </div>
            <FormField label="Stock" id="edit-stock" name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} />
          </div>
          <div className="relative">
            <FormField label="Price" id="edit-price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} className="pl-7" />
            <span className="absolute bottom-3 left-3 text-sm text-[#737373]">₫</span>
          </div>
          {error && <p className="text-sm text-[#ef4343]">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-[#e6e6e6] px-6 py-4">
          <button onClick={onClose} className="h-10 rounded-lg border border-[#e6e6e6] px-5 text-sm font-medium text-[#737373] hover:bg-[#f9f9f9]">Cancel</button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ listing, onClose, onDeleted }) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteListing(user.id, listing.id);
    setDeleting(false);
    if (res.success) onDeleted(listing.id);
    else setError(res.message);
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/45 px-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-1 text-base font-bold text-[#121212]">Delete Listing</h3>
        <p className="mb-5 text-sm text-[#737373]">
          Are you sure you want to delete <span className="font-semibold text-[#121212]">"{listing.name}"</span>? This cannot be undone.
        </p>
        {error && <p className="mb-3 text-sm text-[#ef4343]">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-[#e6e6e6] text-sm font-medium text-[#737373] hover:bg-[#f9f9f9]">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex-1 h-10 rounded-lg bg-[#ef4343] text-sm font-semibold text-white hover:bg-[#d93a3a] disabled:opacity-60">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListingRow({ listing, onEdit, onDelete, onBoost, boostingId }) {
  const { label, variant } = stockBadge(listing.stock);
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#e6e6e6] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#f0f0f0] bg-[#f7f6fb]">
        <img src={listing.image} alt={listing.name} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ad93e6]">{listing.fandom}</span>
          <span className="hidden text-[#e6e6e6] sm:inline">·</span>
          <span className="hidden text-xs text-[#737373] sm:inline">{listing.type}</span>
          <Badge variant={variant} className="text-[10px] px-2 py-0.5">{label}</Badge>
          {listing.isBoosted && <Badge variant="live" className="text-[10px] px-2 py-0.5">Boosted</Badge>}
        </div>
        <p className="truncate text-sm font-semibold text-[#121212]">{listing.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#737373]">
          <span>Condition: <span className="font-medium text-[#121212]">{listing.condition}</span></span>
          <span>Stock: <span className="font-medium text-[#121212]">{listing.stock}</span></span>
          <span>Listed: <span className="font-medium text-[#121212]">{listing.createdAt}</span></span>
        </div>
      </div>
      <p className="hidden shrink-0 text-base font-bold text-[#121212] sm:block">{formatCurrency(listing.price)}</p>
      <div className="flex shrink-0 items-center gap-2">
        {!listing.isBoosted && (
          <button
            onClick={() => onBoost(listing)}
            disabled={boostingId === listing.id || listing.stock <= 0 || listing.isAuction}
            className="rounded-lg border border-[#ad93e6] px-2.5 py-1.5 text-xs font-semibold text-[#ad93e6] hover:bg-[rgba(173,147,230,0.1)] disabled:opacity-50"
            title={listing.stock <= 0 ? "Only in-stock listing can be boosted" : "Boost this item for 24h"}
          >
            {boostingId === listing.id ? "Boosting..." : "Boost"}
          </button>
        )}
        <button onClick={() => onEdit(listing)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e6e6] text-[#737373] hover:border-[#ad93e6] hover:text-[#ad93e6]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
          </svg>
        </button>
        <button onClick={() => onDelete(listing)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e6e6] text-[#737373] hover:border-[#ef4343] hover:text-[#ef4343]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SoldItemRow({ item }) {
  const date = item.soldAt ? formatDate(item.soldAt) : "—";
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#e6e6e6] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#f0f0f0] bg-[#f7f6fb] flex items-center justify-center">
        {item.image
          ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          : <svg className="h-6 w-6 text-[#d4d4d4]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5" /></svg>
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#121212]">{item.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#737373]">
          <span>Order: <span className="font-medium text-[#121212]">#{item.orderId}</span></span>
          <span>Qty: <span className="font-medium text-[#121212]">{item.qty}</span></span>
          <span>Sold: <span className="font-medium text-[#121212]">{date}</span></span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-base font-bold text-[#121212]">{formatCurrency(item.price * item.qty)}</p>
        <p className="text-xs text-[#737373]">{formatCurrency(item.price)} × {item.qty}</p>
      </div>
    </div>
  );
}

/* ── Listings tab content ── */
function ListingsTab({ user }) {
  const [subTab, setSubTab]           = useState("listings");
  const [listings, setListings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [soldItems, setSoldItems]     = useState([]);
  const [soldLoading, setSoldLoading] = useState(false);
  const [soldFetched, setSoldFetched] = useState(false);
  const [filter, setFilter]           = useState("All");
  const [search, setSearch]           = useState("");
  const [editing, setEditing]         = useState(null);
  const [deleting, setDeleting]       = useState(null);
  const [boostingId, setBoostingId]   = useState(null);
  const [toast, setToast]             = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await getListingsByUser(user.id);
    setLoading(false);
    if (res.success) setListings(res.data);
  }, [user]);

  useEffect(() => { load().catch(() => setLoading(false)); }, [load]);

  const handleSubTabChange = (tab) => {
    setSubTab(tab);
    if (tab === "sold" && !soldFetched && user) {
      setSoldLoading(true);
      getSoldItems(user.id).then((res) => {
        if (res.success) {
          const items = Array.isArray(res.data) ? res.data : [];
          setSoldItems(items.sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt)));
        }
        setSoldLoading(false);
        setSoldFetched(true);
      });
    }
  };

  const handleSaved = (updated) => {
    setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setEditing(null);
    showToast("Listing updated successfully!");
  };

  const handleDeleted = (id) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
    showToast("Listing deleted.", "error");
  };

  const handleBoost = async (listing) => {
    if (!listing?.id || boostingId) return;
    setBoostingId(listing.id);
    const res = await createProductBoostPayment({ productId: listing.id });
    setBoostingId(null);

    if (!res.success) {
      showToast(res.message ?? "Failed to create boost payment.", "error");
      return;
    }

    const payUrl = res.data?.payUrl;
    if (!payUrl) {
      showToast("Missing VNPay payment URL.", "error");
      return;
    }

    window.location.href = payUrl;
  };

  const visible = listings.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.fandom.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "All") return true;
    if (filter === "In Stock") return l.stock > 3;
    if (filter === "Low Stock") return l.stock > 0 && l.stock <= 3;
    if (filter === "Out of Stock") return l.stock === 0;
    return true;
  });

  const inStock    = listings.filter((l) => l.stock > 0).length;
  const outOfStock = listings.filter((l) => l.stock === 0).length;
  const estValue   = listings.reduce((s, l) => s + l.price * l.stock, 0);

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#737373]">{listings.length} item{listings.length !== 1 ? "s" : ""} listed</p>
        <Link to="/sell" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#ad93e6] px-4 text-sm font-semibold text-white hover:bg-[#9d7ed9]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total"       value={listings.length} />
        <StatCard label="In Stock"    value={inStock} />
        <StatCard label="Out of Stock" value={outOfStock} />
        <StatCard label="Est. Value"  value={formatCurrency(estValue)} />
      </div>

      {/* Sub-tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-[#e6e6e6] bg-[#f4f3f7] p-1">
        {[{ key: "listings", label: "My Listings", count: listings.length }, { key: "sold", label: "Sold Items", count: soldItems.length }].map((t) => (
          <button key={t.key} onClick={() => handleSubTabChange(t.key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${subTab === t.key ? "bg-white text-[#121212] shadow-sm" : "text-[#737373] hover:text-[#121212]"}`}>
            {t.label}
            {(t.key === "sold" ? soldFetched : true) && (
              <span className={`text-xs ${subTab === t.key ? "text-[#ad93e6]" : "text-[#b3b3b3]"}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search + filter */}
      {subTab === "listings" && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b3b3b3]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input type="text" placeholder="Search listings…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#e6e6e6] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#ad93e6]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STOCK_FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "border-[#ad93e6] bg-[#ad93e6] text-white" : "border-[#e6e6e6] text-[#737373] hover:border-[#ad93e6] hover:text-[#ad93e6]"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Listings list */}
      {subTab === "listings" && (
        loading ? <Spinner /> : visible.length === 0
          ? <EmptyState message={listings.length === 0 ? "You haven't listed anything yet." : "No listings match your search."} />
          : <div className="flex flex-col gap-3">{visible.map((l) => <ListingRow key={l.id} listing={l} onEdit={setEditing} onDelete={setDeleting} onBoost={handleBoost} boostingId={boostingId} />)}</div>
      )}

      {/* Sold items */}
      {subTab === "sold" && (
        soldLoading ? <Spinner /> : soldItems.length === 0
          ? <EmptyState message="No sold items yet." />
          : (
            <>
              <div className="mb-4 flex items-center justify-between rounded-xl border border-[#e6e6e6] bg-[#f7f6fb] px-5 py-3">
                <span className="text-sm text-[#737373]">{soldItems.length} item{soldItems.length !== 1 ? "s" : ""} sold</span>
                <span className="text-base font-bold text-[#121212]">
                  Total revenue: {formatCurrency(soldItems.reduce((s, i) => s + i.price * i.qty, 0))}
                </span>
              </div>
              <div className="flex flex-col gap-3">{soldItems.map((item) => <SoldItemRow key={`${item.orderId}-${item.productId}`} item={item} />)}</div>
            </>
          )
      )}

      {/* Modals */}
      {editing  && <EditModal   listing={editing}  onClose={() => setEditing(null)}  onSaved={handleSaved} />}
      {deleting && <DeleteModal listing={deleting} onClose={() => setDeleting(null)} onDeleted={handleDeleted} />}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-300 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.type === "error" ? "bg-[#ef4343]" : "bg-[#22c55e]"}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════
   ORDERS TAB — components
   ════════════════════════════════════════════════════ */
const ORDER_TABS = [
  { key: "all",       label: "All" },
  { key: "toShip",    label: "To Ship" },
  { key: "shipping",  label: "Shipping" },
  { key: "delivered", label: "Completed" },
];

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
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-[#f0f0f0]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#b3b3b3]">Order #{order.id}</span>
          {order.buyerName && (
            <span className="text-xs text-[#737373]">Buyer: <span className="font-medium text-[#121212]">{order.buyerName}</span></span>
          )}
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#e6e6e6] bg-[#f4f3f7] flex items-center justify-center">
            {first?.image
              ? <img src={first.image} alt={first.name} className="h-full w-full object-contain p-1" />
              : <svg className="h-6 w-6 text-[#d4d4d4]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909" /></svg>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-[#121212]">
              {first?.name ?? "—"}
              {extra > 0 && <span className="ml-1 text-xs font-normal text-[#737373]">+{extra} more item{extra > 1 ? "s" : ""}</span>}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#737373]">
              <span>{formatDate(order.createdAt)}</span>
              {order.payment && <><span>·</span><span>{PAYMENT_LABELS[order.payment] ?? order.payment}</span></>}
              {order.shippingAddress && <><span>·</span><span className="truncate max-w-[140px]">{order.shippingAddress}</span></>}
            </div>
          </div>
          <p className="shrink-0 text-base font-bold text-[#121212]">{formatCurrency(order.total ?? 0)}</p>
        </div>

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

        {(order.status === "pending" || order.status === "paid") && (
          <button onClick={handleShip} disabled={loading}
            className="w-full rounded-lg bg-[#ad93e6] py-2 text-sm font-semibold text-white hover:bg-[#9d7ed9] disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                Confirm Shipment
              </>
            )}
          </button>
        )}
        {order.status === "shipping" && (
          <div className="flex items-center gap-2 rounded-lg bg-[rgba(173,147,230,0.08)] border border-[#d4c6f5] px-3 py-2 text-xs text-[#5b3f9e]">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            Shipped — waiting for buyer to confirm receipt
          </div>
        )}
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

/* ── Orders tab content ── */
function OrdersTab({ user }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("all");

  useEffect(() => {
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
  }, [user.id]);

  const handleShip = async (orderId) => {
    const res = await shipOrder(orderId, user.id);
    if (res.success) setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "shipping" } : o));
  };

  const filtered = useMemo(() => {
    if (tab === "all") return orders;
    if (tab === "toShip") return orders.filter((o) => o.status === "pending" || o.status === "paid");
    return orders.filter((o) => o.status === tab);
  }, [orders, tab]);

  const pendingCount  = orders.filter((o) => o.status === "pending" || o.status === "paid").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const totalRevenue  = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Orders" value={orders.length} />
        <StatCard label="To Ship"      value={pendingCount}   sub={pendingCount > 0 ? "Needs action" : "All done!"} />
        <StatCard label="Completed"    value={deliveredCount} />
        <StatCard label="Revenue"      value={formatCurrency(totalRevenue)} sub="Delivered orders" />
      </div>

      {/* Sub-tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-1">
        {ORDER_TABS.map((t) => {
          const count = t.key === "all"
            ? orders.length
            : t.key === "toShip"
              ? orders.filter((o) => o.status === "pending" || o.status === "paid").length
              : orders.filter((o) => o.status === t.key).length;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${tab === t.key ? "bg-white text-[#121212] shadow-sm" : "text-[#737373] hover:text-[#121212]"}`}>
              {t.label}
              {count > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${tab === t.key ? "bg-[#ad93e6] text-white" : "bg-[#e6e6e6] text-[#737373]"}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (tab === "all" || tab === "toShip") && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92400e]">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          You have <span className="font-bold mx-1">{pendingCount}</span> order{pendingCount > 1 ? "s" : ""} waiting to be shipped.
        </div>
      )}

      {/* List */}
      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState message="No orders found." /> : (
        <ol className="flex flex-col gap-3">
          {filtered.map((order) => <SellerOrderCard key={order.id} order={order} onShip={handleShip} />)}
        </ol>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════ */
const TOP_TABS = [
  {
    key: "listings",
    label: "Listings",
    icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>,
  },
  {
    key: "orders",
    label: "Orders",
    icon: <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
  },
];

export default function MyShopPage() {
  const { user, isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "orders" ? "orders" : "listings";

  const setTab = (key) => setSearchParams(key === "listings" ? {} : { tab: key }, { replace: true });

  if (!isLoggedIn) {
    return (
      <PageLayout>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(173,147,230,0.1)]">
            <svg className="h-8 w-8 text-[#ad93e6]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#121212]">Sign in to manage your shop</h2>
          <p className="text-sm text-[#737373]">You need to be logged in to access your shop.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 md:py-14">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#121212] md:text-3xl">My Shop</h1>
          <p className="mt-0.5 text-sm text-[#737373]">Manage your listings and orders</p>
        </div>

        {/* Top-level tabs */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-[#e6e6e6] bg-[#f7f6fb] p-1">
          {TOP_TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${activeTab === t.key ? "bg-white text-[#5b3f9e] shadow-sm" : "text-[#737373] hover:text-[#121212]"}`}>
              <span className={activeTab === t.key ? "text-[#ad93e6]" : ""}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "listings" && <ListingsTab user={user} />}
        {activeTab === "orders"   && <OrdersTab   user={user} />}
      </div>
    </PageLayout>
  );
}
