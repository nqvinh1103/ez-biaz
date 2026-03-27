import AuctionCard from "../components/cards/AuctionCard";
import PageLayout from "../components/layout/PageLayout";
import { allAuctions } from "../data/landingData";

function AuctionPage() {
  return (
    <PageLayout>
      {/* mainClassName="bg-[rgba(244,243,247,0.4)] px-4 md:px-6 lg:px-24 xl:px-[260px]" */}
      <div className="mx-auto w-full max-w-350 px-4 py-10 md:py-16">
        {/* Heading */}
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#121212] md:text-3xl">
            Live Auctions
          </h1>
          <p className="text-sm text-[#737373]">
            Bid on rare &amp; limited K-pop collectibles
          </p>
        </div>

        {/* Auction grid */}
        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          role="list"
        >
          {allAuctions.map((auction) => (
            <AuctionCard
              key={`${auction.artist}-${auction.name}`}
              {...auction}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

export default AuctionPage;
