import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import BackLink from "../components/ui/BackLink";
import Button from "../components/ui/Button";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { createAuction, getListingsByUser } from "../lib/ezbiasApi";
import { cn } from "../utils/cn";
import { formatCurrency } from "../utils/formatters";

/* ── Constants ──────────────────────────────────────────────────────────── */
const DURATIONS = [
  // Testing
  { label: "30s (Test)", seconds: 30 },

  // Normal
  { label: "1 Day", hours: 24 },
  { label: "3 Days", hours: 72 },
  { label: "7 Days", hours: 168 },
  { label: "14 Days", hours: 336 },
];

/* ── Icons ──────────────────────────────────────────────────────────────── */
const GavelIcon = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.042 21.672L13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);

const BoltIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
    />
  </svg>
);

/* ── Product picker card ─────────────────────────────────────────────────── */
function ProductPickerCard({ product, selected, onSelect }) {
  const unavailable = product.isAuction || product.stock <= 0;

  return (
    <button
      type="button"
      disabled={unavailable}
      onClick={() => !unavailable && onSelect(product.id)}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all",
        unavailable
          ? "cursor-not-allowed border-[#e6e6e6] opacity-50"
          : selected
            ? "border-[#ad93e6] shadow-[0_0_0_3px_rgba(173,147,230,0.2)]"
            : "border-[#e6e6e6] hover:border-[#ad93e6]/50 cursor-pointer",
      )}
    >
      {/* Selected overlay */}
      {selected && (
        <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#ad93e6] text-white">
          <CheckIcon />
        </span>
      )}

      {/* Already in auction badge */}
      {product.isAuction && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          In Auction
        </span>
      )}

      {/* Out of stock badge */}
      {!product.isAuction && product.stock <= 0 && (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
          Out of Stock
        </span>
      )}

      {/* Image */}
      <div className="aspect-square w-full overflow-hidden bg-[#f4f3f7]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-2"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#ad93e6]">
          {product.fandom ?? product.artist}
        </p>
        <p className="line-clamp-2 text-xs font-semibold text-[#121212]">
          {product.name}
        </p>
        <p className="mt-1 text-sm font-bold text-[#121212]">
          {formatCurrency(product.price)}
        </p>
        <p
          className={cn(
            "text-[10px]",
            product.stock > 5
              ? "text-green-600"
              : product.stock > 0
                ? "text-amber-600"
                : "text-red-500",
          )}
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>
      </div>
    </button>
  );
}

/* ── Section header ─────────────────────────────────────────────────────── */
function SectionHeader({ step, title }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ad93e6] text-xs font-bold text-white">
        {step}
      </span>
      <h2 className="text-sm font-semibold text-[#121212]">{title}</h2>
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────────────── */
function ListingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border-2 border-[#e6e6e6]">
          <div className="aspect-square w-full bg-[#f0edf7]" />
          <div className="flex flex-col gap-2 p-3">
            <div className="h-2.5 w-12 rounded bg-[#f0edf7]" />
            <div className="h-3 w-full rounded bg-[#f0edf7]" />
            <div className="h-4 w-16 rounded bg-[#f0edf7]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function CreateAuctionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [listings, setListings] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const [durationHours, setDurationHours] = useState(72); // default 3 days
  const [durationSeconds, setDurationSeconds] = useState(null); // test-only
  const [isUrgent, setIsUrgent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /* fetch seller's listings on mount */
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    getListingsByUser(user.id).then((res) => {
      if (!mounted) return;
      if (res.success) setListings(res.data ?? []);
      else setFetchError(res.message ?? "Failed to load your listings.");
      setLoadingList(false);
    });
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const selectedProduct = listings.find((p) => p.id === selectedId) ?? null;
  const isValid = !!selectedId && (
    (durationSeconds != null && durationSeconds >= 30) ||
    (durationSeconds == null && durationHours >= 1 && durationHours <= 336)
  );

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);

    const res = await createAuction({
      productId: selectedId,
      sellerId: user.id,
      durationHours: durationSeconds == null ? durationHours : null,
      durationSeconds,
      isUrgent,
    });

    setSubmitting(false);
    if (res.success) {
      showToast("Auction created successfully!", "success");
      navigate("/auction");
    } else {
      setError(res.message ?? "Failed to create auction. Please try again.");
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[760px] px-4 py-10 md:py-14">
        <BackLink to="/auction" label="Back to Auctions" />

        {/* Page title */}
        <div className="mb-10 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ad93e6]">
            <GavelIcon />
          </span>
          <h1 className="text-2xl font-bold text-[#121212]">
            Create an Auction
          </h1>
        </div>

        {/* ── Step 1: Pick a product ──────────────────────────────── */}
        <section className="mb-10">
          <SectionHeader step="1" title="Select a Product to Auction" />

          <div className="mb-4 text-right">
            <Link
              to="/sell"
              className="text-xs font-semibold text-[#ad93e6] hover:underline"
            >
              Create product?
            </Link>
          </div>

          {loadingList ? (
            <ListingSkeleton />
          ) : fetchError ? (
            <p className="text-sm text-[#ef4343]">{fetchError}</p>
          ) : listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e6e6e6] py-12 text-center">
              <p className="text-sm text-[#737373]">
                You have no listings yet.
              </p>
              <Link
                to="/sell"
                className="mt-2 inline-block text-sm font-semibold text-[#ad93e6] hover:underline"
              >
                Create a listing first →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listings.map((product) => (
                <ProductPickerCard
                  key={product.id}
                  product={product}
                  selected={selectedId === product.id}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Step 2: Auction settings ────────────────────────────── */}
        <section className="mb-10">
          <SectionHeader step="2" title="Auction Settings" />

          <div className="rounded-xl border border-[#e6e6e6] bg-white p-5 flex flex-col gap-6">
            {/* Duration */}
            <div>
              <p className="mb-2 text-xs font-medium text-[#737373]">
                Duration
              </p>
              <div className="flex flex-wrap gap-2">
                {DURATIONS.map(({ label, hours, seconds }) => {
                  const active = seconds != null
                    ? durationSeconds === seconds
                    : durationSeconds == null && durationHours === hours;

                  return (
                    <button
                      key={seconds != null ? `s${seconds}` : `h${hours}`}
                      type="button"
                      onClick={() => {
                        if (seconds != null) {
                          setDurationSeconds(seconds);
                        } else {
                          setDurationSeconds(null);
                          setDurationHours(hours);
                        }
                      }}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                        active
                          ? "border-[#ad93e6] bg-[#ad93e6] text-white"
                          : "border-[#e6e6e6] text-[#737373] hover:border-[#ad93e6] hover:text-[#ad93e6]",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-[#b3b3b3]">
                {durationSeconds != null
                  ? `Auction ends in ${durationSeconds}s (${DURATIONS.find((d) => d.seconds === durationSeconds)?.label ?? `${durationSeconds}s`})`
                  : `Auction ends in ${durationHours}h (${DURATIONS.find((d) => d.hours === durationHours)?.label ?? `${durationHours}h`})`}
              </p>
            </div>

            {/* Urgent toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#ef4343]">
                  <BoltIcon />
                </span>
                <div>
                  <p className="text-sm font-medium text-[#121212]">
                    Mark as Urgent
                  </p>
                  <p className="text-xs text-[#737373]">
                    Shows a red timer badge — draws more attention
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isUrgent}
                onClick={() => setIsUrgent((v) => !v)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  isUrgent ? "bg-[#ef4343]" : "bg-[#e6e6e6]",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform",
                    isUrgent ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          </div>
        </section>

        {/* ── Preview ─────────────────────────────────────────────── */}
        {selectedProduct && (
          <section className="mb-8">
            <SectionHeader step="3" title="Preview" />
            <div className="flex items-center gap-4 rounded-xl border border-[#ad93e6]/30 bg-[rgba(173,147,230,0.04)] p-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#e6e6e6] bg-[#f4f3f7]">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="h-full w-full object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#ad93e6]">
                  {selectedProduct.fandom ?? selectedProduct.artist}
                </p>
                <p className="truncate text-sm font-semibold text-[#121212]">
                  {selectedProduct.name}
                </p>
                <p className="text-xs text-[#737373]">
                  Floor price:{" "}
                  <span className="font-semibold text-[#121212]">
                    {formatCurrency(selectedProduct.price)}
                  </span>
                  {" · "}Duration:{" "}
                  <span className="font-semibold text-[#121212]">
                    {durationSeconds != null
                      ? (DURATIONS.find((d) => d.seconds === durationSeconds)?.label ?? `${durationSeconds}s`)
                      : (DURATIONS.find((d) => d.hours === durationHours)?.label ?? `${durationHours}h`)}
                  </span>
                  {isUrgent && (
                    <span className="ml-2 text-[#ef4343] font-semibold">
                      ⚡ Urgent
                    </span>
                  )}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── Submit ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2">
          {error && <p className="w-full text-sm text-[#ef4343]">{error}</p>}
          <Button
            size="lg"
            className="w-full"
            disabled={!isValid || submitting}
            type="button"
            onClick={handleSubmit}
          >
            <GavelIcon className="h-4 w-4" />
            {submitting ? "Creating…" : "Start Auction"}
          </Button>
          {!selectedId && (
            <p className="text-xs text-[#737373]">
              Select a product to continue.
            </p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
