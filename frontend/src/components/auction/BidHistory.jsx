import { memo } from "react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";

/**
 * Ordered list of all bids for an auction item.
 *
 * @param {{
 *   bids: Array<{
 *     id: number,
 *     user: string,
 *     avatar: string,
 *     avatarBg: string,
 *     timeAgo: string,
 *     amount: string,
 *     isWinning: boolean,
 *   }>,
 * }} props
 */
const BidHistory = memo(function BidHistory({ bids }) {
  return (
    <section aria-label="Bid history">
      <div className="mb-4 flex items-center gap-2">
        <svg
          className="h-4 w-4 text-[#ad93e6]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <h2 className="text-base font-bold text-[#121212]">Bid History</h2>
        <span className="text-sm text-[#737373]">({bids.length} Bids)</span>
      </div>

      <ol className="overflow-hidden rounded-xl border border-[#e6e6e6] divide-y divide-[#f0f0f0]">
        {bids.map((bid) => (
          <li
            key={bid.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              bid.isWinning ? "bg-[rgba(173,147,230,0.08)]" : "bg-white"
            }`}
          >
            <Avatar initials={bid.avatar} bg={bid.avatarBg} />

            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-[#121212]">
                  {bid.user}
                </span>
                {bid.isWinning && <Badge variant="winning">Winning</Badge>}
              </div>
              <span className="text-xs text-[#737373]">{bid.timeAgo}</span>
            </div>

            <span className="shrink-0 text-sm font-bold text-[#121212]">
              {bid.amount}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
});

export default BidHistory;
