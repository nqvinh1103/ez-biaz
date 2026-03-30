import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import BackLink from "../components/ui/BackLink";
import Button from "../components/ui/Button";
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

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    setError(null);

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
      qty: 1,
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
          <div className="flex flex-col gap-8 md:flex-row md:gap-12">

            {/* ── Left: Gallery ─────────────────────────────── */}
            <div className="w-full md:max-w-sm">
              <ImageGallery images={images} />
            </div>

            {/* ── Right: Info ───────────────────────────────── */}
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

              {/* Details grid */}
              <div className="flex flex-col gap-2 rounded-xl border border-[#e6e6e6] bg-[#fafafa] p-4">
                <InfoRow label="Fandom"    value={product.fandom ?? product.artist} />
                <InfoRow label="Category"  value={product.itemTypes?.join(", ") ?? product.type} />
                <InfoRow label="Condition" value={product.condition} />
                <InfoRow label="Seller"    value={product.sellerName ?? product.seller} />
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
                {added ? "Added to Cart!" : inCart ? "Already in Cart" : "Add to Cart"}
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
        ) : null}
      </div>
    </PageLayout>
  );
}

export default ProductDetailPage;
