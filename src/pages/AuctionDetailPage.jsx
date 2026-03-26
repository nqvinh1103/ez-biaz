import { useState } from "react";
import BidHistory from "../components/auction/BidHistory";
import CountdownTimer from "../components/auction/CountdownTimer";
import PageLayout from "../components/layout/PageLayout";
import BackLink from "../components/ui/BackLink";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { BID_HISTORY, INITIAL_AUCTION_SECONDS } from "../data/auctionData";
import { useCountdown } from "../hooks/useCountdown";

const TrendIcon = () => (
  <svg
    className="h-4 w-4 text-[#ad93e6]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
    />
  </svg>
);

const RocketIcon = () => (
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
      d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
    />
  </svg>
);

const MIN_BID = 315.0;

function AuctionDetailPage() {
  const timer = useCountdown(INITIAL_AUCTION_SECONDS);
  const [bidInput, setBidInput] = useState(String(MIN_BID.toFixed(2)));

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[1000px] px-4 py-10 md:py-14">
        <BackLink to="/auction" label="Back to Auctions" />

        {/* ── Product + Info ──────────────────────────────────────── */}
        <div className="mb-10 flex flex-col gap-8 md:flex-row md:gap-12">
          {/* Image */}
          <div className="h-64 w-full shrink-0 overflow-hidden rounded-2xl border border-[#e6e6e6] bg-[#f4f3f7] md:h-72 md:w-80">
            <img
              src="https://www.figma.com/api/mcp/asset/6e9f9a2d-96ef-49a8-84b5-33e0218c2f8d"
              alt="BTS Holographic Photocard Limited Edition"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-4">
            <Badge variant="live" dot>LIVE AUCTION</Badge>

            <h1 className="text-2xl font-bold leading-8 text-[#121212] md:text-3xl">
              BTS Holographic Photocard — Limited Edition
            </h1>

            <p className="text-sm leading-6 text-[#737373]">
              Ultra-rare holographic BTS group photocard from the 2023 Proof
              Collector&apos;s Edition. Sealed in original acrylic display case.
              One of only 500 produced worldwide — a must-have for any serious
              collector.
            </p>

            <CountdownTimer
              hours={timer.hours}
              minutes={timer.minutes}
              secs={timer.secs}
            />

            {/* Prices */}
            <div className="flex items-end gap-10">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
                  Floor Price
                </p>
                <p className="text-lg font-bold text-[#121212]">$150.00</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
                  Current Highest Bid
                </p>
                <div className="flex items-center gap-1.5">
                  <TrendIcon />
                  <p className="text-2xl font-bold text-[#ad93e6]">$310.00</p>
                </div>
              </div>
            </div>

            {/* Bid input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#737373]">
                  $
                </span>
                <input
                  type="number"
                  min={MIN_BID}
                  step="0.01"
                  value={bidInput}
                  onChange={(e) => setBidInput(e.target.value)}
                  placeholder={`${MIN_BID.toFixed(2)} or higher`}
                  aria-label="Your bid amount"
                  className="h-10 w-full rounded-lg border border-[#e6e6e6] pl-7 pr-4 text-sm text-[#121212] placeholder-[#b3b3b3] outline-none focus:border-[#ad93e6] focus:ring-2 focus:ring-[rgba(173,147,230,0.2)]"
                />
              </div>
              <Button type="button">
                <RocketIcon />
                Place Bid
              </Button>
            </div>
          </div>
        </div>

        {/* ── Bid History ──────────────────────────────────────────── */}
        <BidHistory bids={BID_HISTORY} />
      </div>
    </PageLayout>
  );
}

export default AuctionDetailPage;
