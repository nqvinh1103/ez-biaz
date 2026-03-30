import { useEffect, useMemo, useState } from "react";
import AuctionCard from "../components/cards/AuctionCard";
import PageLayout from "../components/layout/PageLayout";
import { getAuctions } from "../lib/ezbiasApi";

function formatTimer(endsAt, nowMs) {
  const end = new Date(endsAt).getTime();
  const diff = Math.max(0, end - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  if (totalSeconds <= 0) return "Ended";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function AuctionPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getAuctions({ isLive: true });
      if (!mounted) return;
      if (res.success) setAuctions(res.data ?? []);
      else setError(res.message ?? "Failed to load auctions.");
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cards = useMemo(
    () =>
      auctions.map((a) => ({
        id: a.id,
        artist: a.artist,
        name: a.name,
        currentBid: a.currentBid,
        timer: formatTimer(a.endsAt, nowMs),
        isUrgent: a.isUrgent,
        image: a.image,
        containImage: a.containImage,
      })),
    [auctions, nowMs],
  );

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-350 px-4 py-10 md:py-16">
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#121212] md:text-3xl">
            Live Auctions
          </h1>
          <p className="text-sm text-[#737373]">
            Bid on rare &amp; limited K-pop collectibles
          </p>
        </div>

        {error && (
          <p className="pb-4 text-center text-sm text-[#ef4343]">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
            role="list"
          >
            {cards.map((auction) => (
              <AuctionCard key={auction.id} {...auction} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default AuctionPage;
