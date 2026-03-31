import { useState } from "react";

/* ── Display-only: render filled/half/empty stars ── */
export function StarDisplay({ rating = 0, max = 5, size = "sm" }) {
  const sz = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <svg key={i} className={`${sz} shrink-0`} viewBox="0 0 20 20" fill={filled ? "#ad93e6" : "#e6e6e6"}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </span>
  );
}

/* ── Interactive: clickable stars for input ── */
export function StarPicker({ value = 0, onChange, max = 5 }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const star = i + 1;
        const filled = star <= active;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
          >
            <svg className="h-7 w-7" viewBox="0 0 20 20" fill={filled ? "#ad93e6" : "#e6e6e6"}>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </span>
  );
}
