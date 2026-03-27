import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import BidHistory from "../components/auction/BidHistory";
import CountdownTimer from "../components/auction/CountdownTimer";
import PageLayout from "../components/layout/PageLayout";
import BackLink from "../components/ui/BackLink";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { INITIAL_AUCTION_SECONDS } from "../data/auctionData";
import { useCountdown } from "../hooks/useCountdown";
import { getAuctionById, placeBid as apiPlaceBid } from "../mock/mockApi";

/* ── helpers ──────────────────────────────────────────────────── */
function formatTimeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

/** Normalise a raw bid object from the mock API to the shape BidHistory expects. */
function normalizeBid(bid) {
  return {
    ...bid,
    amount: typeof bid.amount === "number" ? `$${bid.amount.toFixed(2)}` : bid.amount,
    timeAgo: bid.placedAt ? formatTimeAgo(bid.placedAt) : (bid.timeAgo ?? ""),
  };
}

/* ── icons ────────────────────────────────────────────────────── */
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

/* ── page ─────────────────────────────────────────────────────── */
function AuctionDetailPage() {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const timer = useCountdown(INITIAL_AUCTION_SECONDS);

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bidInput, setBidInput] = useState("");
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");

  /* load auction on mount */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAuctionById(id).then((res) => {
      if (res.success) {
        setAuction(res.data);
        setBids((res.data.bids ?? []).map(normalizeBid));
        setBidInput((res.data.currentBid + 5).toFixed(2));
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const minBid = auction ? auction.currentBid + 5 : 0;

  const handlePlaceBid = async () => {
    setBidError("");
    setBidSuccess("");

    if (!isLoggedIn) {
      setBidError("Bạn cần đăng nhập để đặt bid.");
      return;
    }

    const amount = parseFloat(bidInput);
    if (isNaN(amount) || amount < minBid) {
      setBidError(`Bid phải ít nhất $${minBid.toFixed(2)} (giá hiện tại + $5.00).`);
      return;
    }

    setBidding(true);
    const res = await apiPlaceBid(user.id, id, amount);
    setBidding(false);

    if (res.success) {
      /* update highest bid display */
      setAuction((prev) => ({ ...prev, currentBid: amount }));

      /* prepend new bid, clear previous winning flags */
      const newBid = normalizeBid(res.data);
      setBids((prev) => [
        newBid,
        ...prev.map((b) => ({ ...b, isWinning: false })),
      ]);

      /* advance minimum bid input */
      setBidInput((amount + 5).toFixed(2));
      setBidSuccess(`Bid $${amount.toFixed(2)} đặt thành công!`);
    } else {
      setBidError(res.message);
    }
  };

  /* ── loading / not-found states ───────────────────────────── */
  if (loading) {
    return (
      <PageLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-[#737373]">Đang tải...</p>
        </div>
      </PageLayout>
    );
  }

  if (!auction) {
    return (
      <PageLayout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-[#737373]">Không tìm thấy auction này.</p>
        </div>
      </PageLayout>
    );
  }

  const isEnded = !auction.isLive;

  /* ── render ───────────────────────────────────────────────── */
  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[1000px] px-4 py-10 md:py-14">
        <BackLink to="/auction" label="Back to Auctions" />

        {/* ── Product + Info ──────────────────────────────── */}
        <div className="mb-10 flex flex-col gap-8 md:flex-row md:gap-12">
          {/* Image */}
          <div className="h-64 w-full shrink-0 overflow-hidden rounded-2xl border border-[#e6e6e6] bg-[#f4f3f7] md:h-72 md:w-80">
            <img
              src={auction.image}
              alt={auction.name}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-4">
            <Badge variant={isEnded ? "default" : "live"} dot={!isEnded}>
              {isEnded ? "AUCTION ENDED" : "LIVE AUCTION"}
            </Badge>

            <h1 className="text-2xl font-bold leading-8 text-[#121212] md:text-3xl">
              {auction.name}
            </h1>

            <p className="text-sm leading-6 text-[#737373]">{auction.description}</p>

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
                <p className="text-lg font-bold text-[#121212]">
                  ${auction.floorPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
                  Current Highest Bid
                </p>
                <div className="flex items-center gap-1.5">
                  <TrendIcon />
                  <p className="text-2xl font-bold text-[#ad93e6]">
                    ${auction.currentBid.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bid input */}
            {!isEnded && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#737373]">
                      $
                    </span>
                    <input
                      type="number"
                      min={minBid}
                      step="0.01"
                      value={bidInput}
                      onChange={(e) => {
                        setBidInput(e.target.value);
                        setBidError("");
                        setBidSuccess("");
                      }}
                      placeholder={`${minBid.toFixed(2)} or higher`}
                      aria-label="Your bid amount"
                      className="h-10 w-full rounded-lg border border-[#e6e6e6] pl-7 pr-4 text-sm text-[#121212] placeholder-[#b3b3b3] outline-none focus:border-[#ad93e6] focus:ring-2 focus:ring-[rgba(173,147,230,0.2)]"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handlePlaceBid}
                    disabled={bidding}
                  >
                    <RocketIcon />
                    {bidding ? "Đang đặt..." : "Place Bid"}
                  </Button>
                </div>

                {/* Hint */}
                {!isLoggedIn && !bidError && (
                  <p className="text-xs text-[#737373]">
                    Đăng nhập để đặt bid.
                  </p>
                )}

                {/* Error / success feedback */}
                {bidError && (
                  <p className="text-xs font-medium text-red-500">{bidError}</p>
                )}
                {bidSuccess && (
                  <p className="text-xs font-medium text-green-600">{bidSuccess}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Bid History ─────────────────────────────────── */}
        <BidHistory bids={bids} />
      </div>
    </PageLayout>
  );
}

export default AuctionDetailPage;
