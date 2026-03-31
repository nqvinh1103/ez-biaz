import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import BackLink from "../components/ui/BackLink";
import Button from "../components/ui/Button";
import { StarDisplay } from "../components/shared/StarRating";
import { formatCurrency } from "../utils/formatters";
import { useLoginModal } from "../context/LoginModalContext";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { getProductById } from "../lib/ezbiasApi";
import { cn } from "../utils/cn";

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const CartIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

/* ── Image Gallery ──────────────────────────────────────────────────────────── */
function ImageGallery({ images }) {
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e6e6e6] bg-[#f4f3f7] aspect-square">
        <img
          key={active}
          src={images[active]}
          alt={`Product image ${active + 1}`}
          className="h-full w-full object-contain p-4 transition-opacity duration-200"
        />

        {/* Prev / Next arrows — only when multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === active ? "w-5 bg-[#ad93e6]" : "w-1.5 bg-[#ad93e6]/30",
                  )}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === active
                  ? "border-[#ad93e6] shadow-sm"
                  : "border-[#e6e6e6] opacity-60 hover:opacity-100",
              )}
              aria-label={`View image ${i + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Condition Badge ─────────────────────────────────────────────────────────── */
const CONDITION_STYLE = {
  "Brand New":  "bg-green-50 text-green-700 border-green-200",
  "Like New":   "bg-blue-50 text-blue-700 border-blue-200",
  "Good":       "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Fair":       "bg-orange-50 text-orange-700 border-orange-200",
  "Poor":       "bg-red-50 text-red-700 border-red-200",
};

function ConditionBadge({ condition }) {
  if (!condition) return null;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", CONDITION_STYLE[condition] ?? "bg-gray-50 text-gray-600 border-gray-200")}>
      {condition}
    </span>
  );
}

/* ── Info Row ────────────────────────────────────────────────────────────────── */
function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="w-24 shrink-0 text-[#737373]">{label}</span>
      <span className="font-medium text-[#121212]">{value}</span>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="flex flex-col gap-8 md:flex-row md:gap-12 animate-pulse">
      <div className="aspect-square w-full rounded-2xl bg-[#f0edf7] md:max-w-sm" />
      <div className="flex flex-1 flex-col gap-4">
        <div className="h-4 w-20 rounded bg-[#f0edf7]" />
        <div className="h-8 w-3/4 rounded bg-[#f0edf7]" />
        <div className="h-10 w-32 rounded bg-[#f0edf7]" />
        <div className="h-20 w-full rounded bg-[#f0edf7]" />
        <div className="h-10 w-full rounded-full bg-[#f0edf7]" />
      </div>
    </div>
  );
}

/* ── Seller Card ─────────────────────────────────────────────────────────────── */
function formatJoinedAt(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function SellerCard({ sellerInfo, sellerRatingSummary }) {
  if (!sellerInfo) return null;
  const { username, fullName, avatar, joinedAt } = sellerInfo;
  const avg   = sellerRatingSummary?.average      ?? 0;
  const total = sellerRatingSummary?.totalReviews ?? 0;
  const breakdown = sellerRatingSummary?.breakdown ?? {};
  const initials = (avatar ?? (fullName ?? username ?? "?")[0]).slice(0, 2).toUpperCase();
  const joined = formatJoinedAt(joinedAt);

  return (
    <div className="rounded-2xl border border-[#e6e6e6] bg-white px-6 py-5">
      <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-[#b3b3b3]">About the Seller</p>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">

        {/* ── Identity ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 sm:w-52 sm:shrink-0">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: "#ad93e6" }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#121212]">{fullName ?? username}</p>
            <p className="truncate text-xs text-[#737373]">@{username}</p>
            {joined && (
              <p className="mt-1 text-[11px] text-[#b3b3b3]">Member since {joined}</p>
            )}
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────── */}
        <div className="hidden w-px self-stretch bg-[#f0f0f0] sm:block" />

        {/* ── Rating summary ───────────────────────────────────── */}
        {total > 0 ? (
          <div className="flex flex-1 items-start gap-6">
            {/* Big score */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-4xl font-bold leading-none text-[#121212]">{avg.toFixed(1)}</p>
              <StarDisplay rating={avg} size="md" />
              <p className="text-xs text-[#737373]">{total} review{total !== 1 ? "s" : ""}</p>
            </div>

            {/* Breakdown bars */}
            <div className="flex flex-1 flex-col gap-1.5 pt-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = Number(breakdown[String(star)] ?? 0);
                const pct   = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-right text-[#737373]">{star}</span>
                    <svg className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="#ad93e6">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                      <div className="h-full rounded-full bg-[#ad93e6] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-4 text-right text-[#b3b3b3]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="self-center text-sm text-[#b3b3b3]">No reviews yet</p>
        )}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
function ProductDetailPage() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const { openLoginModal } = useLoginModal();
  const { addItem, items } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [added, setAdded]   = useState(false);
  const [qty, setQty]       = useState(1);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    setQty(1);

    getProductById(id).then((res) => {
      if (!mounted) return;
      if (res.success) setProduct(res.data);
      else setError(res.message ?? "Product not found.");
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [id]);

  // Normalise single image → array
  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    if (product.image) return [product.image];
    return [];
  }, [product]);

  const inCart = items.some((i) => (i.id ?? i.name) === (product?.id ?? product?.name));

  const handleAddToCart = () => {
    if (!isLoggedIn) { openLoginModal(); return; }
    if (!product || inCart) return;
    addItem({
      id: product.id ?? product.name,
      artist: product.artist ?? product.fandom,
      name: product.name,
      price: Number(product.price),
      image: images[0],
      stock: product.stock,
      qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[1000px] px-4 py-10 md:py-14">
        <BackLink to="/fandoms" label="Back to Shop" />

        {loading ? (
          <Skeleton />
        ) : error ? (
          <p className="py-16 text-center text-sm text-[#737373]">{error}</p>
        ) : product ? (
          <div className="flex flex-col gap-10">

            {/* ── Top: Gallery + Product Info ──────────────────────────── */}
            <div className="flex flex-col gap-8 md:flex-row md:gap-12">

              {/* Left: Gallery */}
              <div className="w-full md:max-w-sm md:shrink-0">
                <ImageGallery images={images} />
              </div>

              {/* Right: Info */}
              <div className="flex flex-1 flex-col gap-5">

                {/* Artist */}
                <p className="text-xs font-semibold uppercase tracking-[0.8px] text-[#ad93e6]">
                  {product.artist ?? product.fandom}
                </p>

                {/* Name */}
                <h1 className="text-2xl font-bold leading-snug text-[#121212] md:text-3xl">
                  {product.name}
                </h1>

                {/* Price */}
                <p className="text-3xl font-bold text-[#121212]">
                  {formatCurrency(product.price)}
                </p>

                {/* Condition + Stock */}
                <div className="flex flex-wrap items-center gap-2">
                  {product.condition && <ConditionBadge condition={product.condition} />}
                  {product.stock != null && (
                    <span className={cn(
                      "text-xs font-medium",
                      product.stock > 5 ? "text-green-600" :
                      product.stock > 0 ? "text-amber-600" : "text-red-500",
                    )}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm leading-6 text-[#737373]">
                    {product.description}
                  </p>
                )}

                {/* Quantity selector — only when in stock and not yet in cart */}
                {product.stock > 0 && !inCart && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#737373]">Quantity</span>
                      <div className={cn(
                        "flex items-center rounded-xl border bg-white transition-colors",
                        qty >= product.stock ? "border-amber-300" : "border-[#e6e6e6]",
                      )}>
                        <button
                          type="button"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          disabled={qty <= 1}
                          className="flex h-9 w-9 items-center justify-center rounded-l-xl text-[#737373] transition-colors hover:bg-[#f4f3f7] disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" clipRule="evenodd" /></svg>
                        </button>
                        <span className="min-w-[2rem] select-none text-center text-sm font-semibold text-[#121212]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                          disabled={qty >= product.stock}
                          className="flex h-9 w-9 items-center justify-center rounded-r-xl text-[#737373] transition-colors hover:bg-[#f4f3f7] disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 0 1 1-1Z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        product.stock <= 3 ? "text-amber-500" : "text-[#b3b3b3]",
                      )}>
                        {product.stock} in stock
                      </span>
                    </div>
                    {qty >= product.stock && (
                      <p className="flex items-center gap-1 text-xs font-medium text-amber-500">
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" /></svg>
                        Maximum quantity reached — only {product.stock} available
                      </p>
                    )}
                  </div>
                )}

                {/* Details grid */}
                <div className="flex flex-col gap-2 rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-4">
                  <InfoRow label="Fandom"    value={product.fandom ?? product.artist} />
                  <InfoRow label="Category"  value={product.itemTypes?.join(", ") ?? product.type} />
                  <InfoRow label="Condition" value={product.condition} />
                  <InfoRow label="Seller"    value={product.sellerInfo?.fullName ?? product.sellerName ?? product.seller} />
                </div>

                {/* Add to cart */}
                <Button
                  size="lg"
                  className="w-full gap-2"
                  disabled={inCart || product.stock === 0}
                  onClick={handleAddToCart}
                  style={
                    added   ? { backgroundColor: "#22c55e" } :
                    inCart  ? { backgroundColor: "#b3b3b3" } :
                    undefined
                  }
                >
                  {added ? <CheckIcon /> : <CartIcon />}
                  {added ? "Added to Cart!" : inCart ? "Already in Cart" : `Add ${qty > 1 ? `${qty} × ` : ""}to Cart`}
                </Button>

                {!isLoggedIn && (
                  <p className="text-center text-xs text-[#737373]">
                    <button onClick={openLoginModal} className="font-semibold text-[#ad93e6] underline underline-offset-2">
                      Sign in
                    </button>
                    {" "}to add items to your cart.
                  </p>
                )}
              </div>
            </div>

            {/* ── Bottom: Seller info (full width) ─────────────────────── */}
            <SellerCard
              sellerInfo={product.sellerInfo}
              sellerRatingSummary={product.sellerRatingSummary}
            />
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
}

export default ProductDetailPage;
