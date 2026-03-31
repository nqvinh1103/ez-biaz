import { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import { StatCard, formatDate } from "../components/shared/OrderShared";
import { StarDisplay } from "../components/shared/StarRating";
import { useAuth } from "../hooks/useAuth";
import { getSellerRatings } from "../lib/ezbiasApi";

const FILTER_TABS = [
  { key: "all",  label: "All" },
  { key: "5",    label: "5 ★" },
  { key: "4",    label: "4 ★" },
  { key: "low",  label: "3 ★ and below" },
];

const TIER_CFG = {
  New:        { color: "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]" },
  Rising:     { color: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]" },
  Trusted:    { color: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]" },
  "Pro Seller": { color: "bg-[rgba(173,147,230,0.12)] text-[#5b3f9e] border-[#d4c6f5]" },
  Elite:      { color: "bg-[#fefce8] text-[#854d0e] border-[#fde68a]" },
};

function getTier(count, avg) {
  if (count >= 100 && avg >= 4.7) return "Elite";
  if (count >= 51  && avg >= 4.3) return "Pro Seller";
  if (count >= 21  && avg >= 4.0) return "Trusted";
  if (count >= 5   && avg >= 3.5) return "Rising";
  return "New";
}

function ReviewCard({ review }) {
  return (
    <div className="rounded-2xl border border-[#e6e6e6] bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: "#ad93e6" }}
          >
            {(review.buyerName ?? "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#121212]">{review.buyerName ?? "Anonymous"}</p>
            <p className="text-[10px] text-[#b3b3b3]">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <StarDisplay rating={review.sellerRating} size="sm" />
          {review.productRating && review.productRating !== review.sellerRating && (
            <span className="text-[10px] text-[#b3b3b3]">
              Product: {review.productRating}/5
            </span>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="mb-3 text-sm text-[#737373] leading-relaxed">"{review.comment}"</p>
      )}

      {review.tags?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#e6e6e6] bg-[#fafafa] px-2.5 py-0.5 text-[11px] text-[#737373]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {review.productName && (
        <p className="text-[11px] text-[#b3b3b3]">
          Re: <span className="font-medium text-[#737373]">{review.productName}</span>
        </p>
      )}
    </div>
  );
}

export default function MyReviewsPage() {
  const { user, isLoggedIn } = useAuth();
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("all");

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;
    let mounted = true;
    getSellerRatings(user.id).then((res) => {
      if (!mounted) return;
      if (res.success) setReviews(res.data?.items ?? []);
      setLoading(false);
    });
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const totalCount = reviews.length;
  const avgRating  = totalCount
    ? Math.round((reviews.reduce((s, r) => s + (r.sellerRating ?? 0), 0) / totalCount) * 10) / 10
    : 0;
  const tier = getTier(totalCount, avgRating);
  const tierCfg = TIER_CFG[tier];

  const filtered = useMemo(() => {
    if (tab === "all") return reviews;
    if (tab === "low") return reviews.filter((r) => (r.sellerRating ?? 0) <= 3);
    return reviews.filter((r) => String(r.sellerRating) === tab);
  }, [reviews, tab]);

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[800px] px-4 py-10 md:py-14">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#121212]">My Reviews</h1>
          <p className="mt-1 text-sm text-[#737373]">Reviews received from buyers</p>
        </div>

        {/* Stats */}
        {!loading && totalCount > 0 && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Aggregate score */}
            <div className="flex items-center gap-4 rounded-2xl border border-[#e6e6e6] bg-white px-5 py-4 shadow-sm">
              <div className="text-center">
                <p className="text-4xl font-bold text-[#121212]">{avgRating.toFixed(1)}</p>
                <StarDisplay rating={avgRating} size="md" />
                <p className="mt-1 text-xs text-[#737373]">{totalCount} review{totalCount !== 1 ? "s" : ""}</p>
              </div>
              <div className="h-12 w-px bg-[#f0f0f0]" />
              <div>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tierCfg.color}`}>
                  {tier === "Elite" && "🏆 "}
                  {tier === "Pro Seller" && "💜 "}
                  {tier === "Trusted" && "✅ "}
                  {tier}
                </span>
                <p className="mt-2 text-xs text-[#737373]">
                  {tier === "New" && "Complete more orders to build reputation"}
                  {tier === "Rising" && "Great start! Keep it up"}
                  {tier === "Trusted" && "Buyers trust your shop"}
                  {tier === "Pro Seller" && "Top-rated seller"}
                  {tier === "Elite" && "Outstanding reputation"}
                </p>
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="flex flex-1 flex-col gap-1.5 rounded-2xl border border-[#e6e6e6] bg-white px-5 py-4 shadow-sm">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.sellerRating === star).length;
                const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-right text-[#737373]">{star}</span>
                    <svg className="h-3 w-3 shrink-0" viewBox="0 0 20 20" fill="#ad93e6">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
                      <div className="h-full rounded-full bg-[#ad93e6] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-[#b3b3b3]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="mb-4 flex gap-2">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === t.key
                  ? "border-[#ad93e6] bg-[#ad93e6] text-white"
                  : "border-[#e6e6e6] text-[#737373] hover:border-[#ad93e6] hover:text-[#ad93e6]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(173,147,230,0.1)]">
              <svg className="h-7 w-7 text-[#ad93e6]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.601a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#121212]">No reviews yet</p>
            <p className="text-xs text-[#737373]">Reviews from buyers will appear here after delivery</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((review, i) => (
              <ReviewCard key={review.id ?? i} review={review} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
