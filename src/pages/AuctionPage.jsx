import { useState, useEffect } from "react";
import AuctionCard from "../components/cards/AuctionCard";
import PageLayout from "../components/layout/PageLayout";
import { getAuctions } from "../mock/mockApi";

function AuctionPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuctions().then((res) => {
      if (res.success) setAuctions(res.data);
      setLoading(false);
    });
  }, []);

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

        {loading ? (
          <p className="text-sm text-[#737373]">Đang tải...</p>
        ) : (
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
            role="list"
          >
            {auctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                id={auction.id}
                artist={auction.artist}
                name={auction.name}
                currentBid={`$${auction.currentBid.toFixed(2)}`}
                timer={auction.isLive ? "Live" : "Ended"}
                isUrgent={auction.isUrgent}
                image={auction.image}
                containImage={auction.containImage ?? false}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default AuctionPage;
