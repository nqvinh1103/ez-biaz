import { useState } from "react";
import { StarPicker } from "./StarRating";
import { submitRating } from "../../lib/ezbiasApi";

const TAGS = [
  "Fast delivery",
  "As described",
  "Good packaging",
  "Great seller",
  "Great quality",
  "Authentic product",
  "Slow shipping",
  "Not as described",
];

export default function RatingModal({ order, onClose, onSubmitted }) {
  const [productRating, setProductRating] = useState(0);
  const [sellerRating,  setSellerRating]  = useState(0);
  const [selectedTags,  setSelectedTags]  = useState([]);
  const [comment,       setComment]       = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState(null);

  const first = order.items?.[0];

  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const canSubmit = productRating > 0 && sellerRating > 0;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    const res = await submitRating({
      orderId: order.id,
      sellerId: order.sellerId,
      productRating,
      sellerRating,
      tags: selectedTags,
      comment: comment.trim(),
    });
    setSubmitting(false);
    if (res.success) {
      onSubmitted?.(order.id);
      onClose();
    } else {
      setError(res.message ?? "Failed to submit review. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <h2 className="text-base font-bold text-[#121212]">Rate your experience</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#737373] transition-colors hover:bg-[#f0f0f0]"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          {/* Order info */}
          <div className="flex items-center gap-3 rounded-xl border border-[#f0f0f0] bg-[#fafafa] px-4 py-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#e6e6e6] bg-white flex items-center justify-center">
              {first?.image ? (
                <img src={first.image} alt={first.name} className="h-full w-full object-contain p-1" />
              ) : (
                <svg className="h-5 w-5 text-[#d4d4d4]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#121212]">
                {first?.name ?? "—"}
                {(order.items?.length ?? 1) > 1 && (
                  <span className="ml-1 text-xs font-normal text-[#737373]">
                    +{order.items.length - 1} more
                  </span>
                )}
              </p>
              {order.sellerName && (
                <p className="text-xs text-[#737373]">Sold by <span className="font-medium text-[#5b3f9e]">{order.sellerName}</span></p>
              )}
            </div>
          </div>

          {/* Product rating */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">Product Quality</p>
            <div className="flex items-center gap-3">
              <StarPicker value={productRating} onChange={setProductRating} />
              {productRating > 0 && (
                <span className="text-sm text-[#737373]">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][productRating]}
                </span>
              )}
            </div>
          </div>

          {/* Seller rating */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">Seller Experience</p>
            <div className="flex items-center gap-3">
              <StarPicker value={sellerRating} onChange={setSellerRating} />
              {sellerRating > 0 && (
                <span className="text-sm text-[#737373]">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][sellerRating]}
                </span>
              )}
            </div>
          </div>

          {/* Quick tags */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#737373]">Quick Tags</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      selected
                        ? "border-[#ad93e6] bg-[rgba(173,147,230,0.12)] text-[#5b3f9e]"
                        : "border-[#e6e6e6] text-[#737373] hover:border-[#ad93e6] hover:text-[#5b3f9e]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
              Write a review <span className="normal-case font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder="Tell others about your experience..."
              className="w-full resize-none rounded-xl border border-[#e6e6e6] bg-[#fafafa] px-3 py-2.5 text-sm text-[#121212] outline-none transition-colors placeholder:text-[#c4c4c4] focus:border-[#ad93e6] focus:bg-white"
            />
            <p className="text-right text-[10px] text-[#b3b3b3]">{comment.length}/500</p>
          </div>

          {error && (
            <p className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#ef4444]">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 border-t border-[#f0f0f0] px-6 py-4">
          <button
            onClick={onClose}
            className="h-10 flex-1 rounded-xl border border-[#e6e6e6] text-sm font-medium text-[#737373] transition-colors hover:border-[#ad93e6] hover:text-[#5b3f9e]"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="h-10 flex-[2] rounded-xl bg-[#ad93e6] text-sm font-semibold text-white transition-colors hover:bg-[#9d7ed9] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
