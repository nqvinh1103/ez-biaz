import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import BackLink from "../components/ui/BackLink";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { useAuth } from "../hooks/useAuth";
import {
  deleteListing,
  getListingsByUser,
  updateListing,
} from "../lib/ezbiasApi";

const CONDITIONS = ["Brand New", "Like New", "Good", "Fair", "Poor"];

const STATUS_BADGE = {
  0: { label: "Out of Stock", variant: "urgent" },
};

function stockBadge(stock) {
  if (stock === 0) return { label: "Out of Stock", variant: "urgent" };
  if (stock <= 3) return { label: "Low Stock", variant: "live" };
  return { label: "In Stock", variant: "default" };
}

/* ── Inline edit modal ──────────────────────────────────────────────────── */
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6e6e6] px-6 py-4">
          <h2 className="text-base font-bold text-[#121212]">Edit Listing</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#737373] hover:bg-[#f0f0f0]"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-6 py-5">
          <FormField
            label="Product Name"
            id="edit-name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <FormField
            label="Description"
            id="edit-desc"
            name="description"
            as="textarea"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Condition */}
            <div className="relative">
              <FormField
                label="Condition"
                id="edit-cond"
                name="condition"
                as="select"
                value={form.condition}
                onChange={handleChange}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </FormField>
              <svg
                className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-[#737373]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19 9-7 7-7-7"
                />
              </svg>
            </div>

            {/* Stock */}
            <FormField
              label="Stock"
              id="edit-stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleChange}
            />
          </div>

          {/* Price */}
          <div className="relative">
            <FormField
              label="Price"
              id="edit-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className="pl-7"
            />
            <span className="absolute bottom-3 left-3 text-sm text-[#737373]">
              $
            </span>
          </div>

          {error && <p className="text-sm text-[#ef4343]">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-[#e6e6e6] px-6 py-4">
          <button
            onClick={onClose}
            className="h-10 rounded-lg border border-[#e6e6e6] px-5 text-sm font-medium text-[#737373] hover:bg-[#f9f9f9]"
          >
            Cancel
          </button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Delete confirm modal ───────────────────────────────────────────────── */
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
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/45 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-1 text-base font-bold text-[#121212]">Delete</h3>
        <p className="mb-5 text-sm text-[#737373]">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#121212]">"{listing.name}"</span>
          ? This action cannot be undone.
        </p>
        {error && <p className="mb-3 text-sm text-[#ef4343]">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-[#e6e6e6] text-sm font-medium text-[#737373] hover:bg-[#f9f9f9]"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 h-10 rounded-lg bg-[#ef4343] text-sm font-semibold text-white transition-colors hover:bg-[#d93a3a] disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Listing row card ───────────────────────────────────────────────────── */
function ListingRow({ listing, onEdit, onDelete }) {
  const { label, variant } = stockBadge(listing.stock);
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[#e6e6e6] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      {/* Image */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#f0f0f0] bg-[#f7f6fb]">
        <img
          src={listing.image}
          alt={listing.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ad93e6]">
            {listing.fandom}
          </span>
          <span className="hidden text-[#e6e6e6] sm:inline">·</span>
          <span className="hidden text-xs text-[#737373] sm:inline">
            {listing.type}
          </span>
          <Badge variant={variant} className="text-[10px] px-2 py-0.5">
            {label}
          </Badge>
        </div>
        <p className="truncate text-sm font-semibold text-[#121212]">
          {listing.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#737373]">
          <span>
            Condition:{" "}
            <span className="font-medium text-[#121212]">
              {listing.condition}
            </span>
          </span>
          <span>
            Stock:{" "}
            <span className="font-medium text-[#121212]">{listing.stock}</span>
          </span>
          <span>
            Listed:{" "}
            <span className="font-medium text-[#121212]">
              {listing.createdAt}
            </span>
          </span>
        </div>
      </div>

      {/* Price */}
      <p className="hidden shrink-0 text-base font-bold text-[#121212] sm:block">
        ${listing.price.toFixed(2)}
      </p>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => onEdit(listing)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e6e6] text-[#737373] transition-colors hover:border-[#ad93e6] hover:text-[#ad93e6]"
          aria-label={`Edit ${listing.name}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
            />
          </svg>
        </button>
        <button
          onClick={() => onDelete(listing)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e6e6e6] text-[#737373] transition-colors hover:border-[#ef4343] hover:text-[#ef4343]"
          aria-label={`Delete ${listing.name}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
const FILTERS = ["All", "In Stock", "Low Stock", "Out of Stock"];

export default function MyListingsPage() {
  const { user, isLoggedIn } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // listing being edited
  const [deleting, setDeleting] = useState(null); // listing being deleted
  const [toast, setToast] = useState(null); // { message, type }

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

  useEffect(() => {
    load().catch(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  /* Filter + search */
  const visible = listings.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.fandom.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "All") return true;
    if (filter === "In Stock") return l.stock > 3;
    if (filter === "Low Stock") return l.stock > 0 && l.stock <= 3;
    if (filter === "Out of Stock") return l.stock === 0;
    return true;
  });

  /* Stats */
  const totalRevenue = listings.reduce((s, l) => s + l.price * l.stock, 0);
  const inStock = listings.filter((l) => l.stock > 0).length;
  const outOfStock = listings.filter((l) => l.stock === 0).length;

  /* Not logged in */
  if (!isLoggedIn) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
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
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#121212]">
            Login to manage your listings
          </h2>
          <p className="text-sm text-[#737373]">
            You need to be logged in to view and manage your items for sale.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 md:py-14">
        <BackLink to="/" label="Back to Home" />

        {/* Page title */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#121212]">My Listings</h1>
            <p className="text-sm text-[#737373]">
              {listings.length} item{listings.length !== 1 ? "s" : ""} listed
            </p>
          </div>
          <Link
            to="/sell"
            className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#ad93e6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#9d7ed9] sm:mt-0"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Listings", value: listings.length },
            { label: "In Stock", value: inStock },
            { label: "Out of Stock", value: outOfStock },
            { label: "Est. Value", value: `$${totalRevenue.toFixed(2)}` },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-[#e6e6e6] bg-white p-4"
            >
              <p className="text-xs text-[#737373]">{s.label}</p>
              <p className="mt-1 text-xl font-bold text-[#121212]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b3b3b3]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search listings…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#e6e6e6] bg-white pl-9 pr-4 text-sm text-[#121212] placeholder-[#b3b3b3] outline-none focus:border-[#ad93e6] focus:ring-2 focus:ring-[rgba(173,147,230,0.2)]"
            />
          </div>
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === f
                    ? "border-[#ad93e6] bg-[#ad93e6] text-white"
                    : "border-[#e6e6e6] text-[#737373] hover:border-[#ad93e6] hover:text-[#ad93e6]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <svg
              className="h-12 w-12 text-[#d4d4d4]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z"
              />
            </svg>
            <p className="text-sm font-medium text-[#737373]">
              {listings.length === 0
                ? "You haven't listed anything yet."
                : "No listings match your search."}
            </p>
            {listings.length === 0 && (
              <Link
                to="/sell"
                className="text-sm font-semibold text-[#ad93e6] hover:underline"
              >
                Post your first listing →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((l) => (
              <ListingRow
                key={l.id}
                listing={l}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {editing && (
        <EditModal
          listing={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
      {deleting && (
        <DeleteModal
          listing={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={handleDeleted}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-300 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
            toast.type === "error" ? "bg-[#ef4343]" : "bg-[#22c55e]"
          }`}
        >
          {toast.type === "error" ? (
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </PageLayout>
  );
}
