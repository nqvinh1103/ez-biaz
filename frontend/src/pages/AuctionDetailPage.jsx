import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BidHistory from "../components/auction/BidHistory";
import CountdownTimer from "../components/auction/CountdownTimer";
import PageLayout from "../components/layout/PageLayout";
import { formatCurrency } from "../utils/formatters";
import BackLink from "../components/ui/BackLink";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useLoginModal } from "../context/LoginModalContext";
import { useAuth } from "../hooks/useAuth";
import { getAuctionById, placeBid } from "../lib/ezbiasApi";

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

function diffToHms(diffMs) {
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return { hours, minutes, secs };
}

function timeAgo(iso) {
  const dt = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - dt);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function AuctionDetailPage() {
  const { id } = useParams();
  const { user, isLoggedIn } = useAuth();
  const { openLoginModal } = useLoginModal();

  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bidInput, setBidInput] = useState("");
  const [placing, setPlacing] = useState(false);

  // fetch auction
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getAuctionById(id);
      if (!mounted) return;
      if (res.success) {
        setAuction(res.data);
        const minBid = (res.data.currentBid ?? 0) + 5;
        setBidInput(minBid.toFixed(2));
      } else {
        setError(res.message ?? "Auction not found.");
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  // tick countdown every second (simple)
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const timer = useMemo(() => {
    if (!auction?.endsAt) return { hours: 0, minutes: 0, secs: 0 };
    return diffToHms(new Date(auction.endsAt).getTime() - now);
  }, [auction?.endsAt, now]);

  const bids = useMemo(() => {
    const list = auction?.bids ?? [];
    return list.map((b) => ({
      id: b.id,
      user: b.username,
      avatar: b.avatar,
      avatarBg: b.avatarBg,
      timeAgo: timeAgo(b.placedAt),
      amount: formatCurrency(Number(b.amount)),
      isWinning: b.isWinning,
    }));
  }, [auction]);

  const handlePlaceBid = async () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    if (!auction || placing) return;
    const amount = Number(bidInput);
    if (!amount || Number.isNaN(amount)) return;

    setPlacing(true);
    setError(null);
    const res = await placeBid(user?.id ?? "u1", auction.id, amount);
    setPlacing(false);

    if (!res.success) {
      setError(res.message ?? "Failed to place bid.");
      return;
    }

    // refresh detail
    const refreshed = await getAuctionById(auction.id);
    if (refreshed.success) {
      setAuction(refreshed.data);
      setBidInput(((refreshed.data.currentBid ?? 0) + 5).toFixed(2));
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[1000px] px-4 py-10 md:py-14">
        <BackLink to="/auction" label="Back to Auctions" />

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
          </div>
        ) : auction ? (
          <>
            <div className="mb-10 flex flex-col gap-8 md:flex-row md:gap-12">
              <div className="h-64 w-full shrink-0 overflow-hidden rounded-2xl border border-[#e6e6e6] bg-[#f4f3f7] md:h-72 md:w-80">
                <img
                  src={auction.image}
                  alt={auction.name}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <Badge variant={auction.isLive ? "live" : "default"} dot>
                  {auction.isLive ? "LIVE AUCTION" : "AUCTION"}
                </Badge>

                <h1 className="text-2xl font-bold leading-8 text-[#121212] md:text-3xl">
                  {auction.name}
                </h1>

                <p className="text-sm leading-6 text-[#737373]">
                  {auction.description}
                </p>

                <CountdownTimer
                  hours={timer.hours}
                  minutes={timer.minutes}
                  secs={timer.secs}
                />

                <div className="flex items-end gap-10">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
                      Floor Price
                    </p>
                    <p className="text-lg font-bold text-[#121212]">
                      {formatCurrency(auction.floorPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#737373]">
                      Current Highest Bid
                    </p>
                    <div className="flex items-center gap-1.5">
                      <TrendIcon />
                      <p className="text-2xl font-bold text-[#ad93e6]">
                        {formatCurrency(auction.currentBid)}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-[#ef4343]">{error}</p>
                )}

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={(Number(auction.currentBid) + 5).toFixed(2)}
                      step="0.01"
                      value={bidInput}
                      onChange={(e) => setBidInput(e.target.value)}
                      placeholder={`${formatCurrency(Number(auction.currentBid) + 5)} or higher`}
                      aria-label="Your bid amount"
                      className="h-10 w-full rounded-lg border border-[#e6e6e6] px-4 text-sm text-[#121212] placeholder-[#b3b3b3] outline-none focus:border-[#ad93e6] focus:ring-2 focus:ring-[rgba(173,147,230,0.2)]"
                    />
                  </div>
                  <Button type="button" disabled={placing || !auction.isLive} onClick={handlePlaceBid}>
                    <RocketIcon />
                    {placing ? "Placing…" : "Place Bid"}
                  </Button>
                </div>
              </div>
            </div>

            <BidHistory bids={bids} />
          </>
        ) : (
          <p className="py-16 text-center text-sm text-[#737373]">Auction not found.</p>
        )}
      </div>
    </PageLayout>
  );
}

export default AuctionDetailPage;
