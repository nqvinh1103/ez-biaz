import { memo } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

/**
 * Card displaying a single auction item with timer, current bid, and bid CTA.
 *
 * @param {{
 *   artist: string,
 *   name: string,
 *   currentBid: string,
 *   timer: string,
 *   isUrgent: boolean,
 *   image: string,
 *   containImage?: boolean,
 *   id?: string | number,
 * }} props
 */
const AuctionCard = memo(function AuctionCard({
  artist,
  name,
  currentBid,
  timer,
  isUrgent,
  image,
  containImage = false,
  id = "detail",
}) {
  return (
    <article
      className="relative overflow-hidden rounded-xl border border-[rgba(230,230,230,0.5)] bg-white p-px shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
      role="listitem"
    >
      {/* Image area */}
      <div className="relative aspect-square w-full overflow-hidden">
        <img
          className={cn(
            "absolute inset-0 h-full w-full",
            containImage ? "object-contain" : "object-cover",
          )}
          src={image}
          alt={name}
        />
        {/* Subtle gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-b from-[rgba(244,243,247,0)] to-[rgba(0,0,0,0.03)]"
          aria-hidden="true"
        />

        {/* Timer badge */}
        <div
          className={cn(
            "absolute right-2.5 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            isUrgent
              ? "bg-[#ef4343] text-white"
              : "bg-[#f0edf7] text-[#4e26a6]",
          )}
          aria-label={`Time remaining: ${timer}`}
        >
          <img
            src={
              isUrgent
                ? "https://www.figma.com/api/mcp/asset/ff3303cc-24af-4e17-ab4f-372ca82615e9"
                : "https://www.figma.com/api/mcp/asset/5e44fef9-dd3d-48b2-bfea-20ee06c2cc5e"
            }
            alt=""
            aria-hidden="true"
            className="h-3 w-3 shrink-0"
          />
          {timer}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.6px] text-[#ad93e6]">
          {artist}
        </p>
        <h3 className="min-h-10 text-sm font-semibold text-[#121212]">
          {name}
        </h3>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
          {/* Bid amount */}
          <div>
            <p className="text-xs text-[#737373]">Current Bid</p>
            <p className="text-lg font-bold text-[#121212]">{currentBid}</p>
          </div>

          {/*
           * Using <Link> styled as a button — avoids the invalid
           * <button><a> nesting that was here before.
           */}
          <Link
            to={`/auction/${id}`}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 self-end whitespace-nowrap rounded-full bg-[#ad93e6] px-3 text-xs font-medium text-white transition-colors hover:bg-[#9d7ed9] sm:self-auto"
            aria-label={`Place bid on ${name}`}
          >
            <img
              src="https://www.figma.com/api/mcp/asset/2199744a-e3f3-49e5-ad38-0cd5df4f9509"
              alt=""
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
            />
            Place Bid
          </Link>
        </div>
      </div>
    </article>
  );
});

export default AuctionCard;
