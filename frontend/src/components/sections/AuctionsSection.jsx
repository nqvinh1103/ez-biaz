import { Link } from "react-router-dom";
import AuctionCard from "../cards/AuctionCard";

function AuctionsSection({ auctions }) {
  return (
    <section
      className="bg-[rgba(244,243,247,0.4)] px-4 md:px-6 lg:px-24 xl:px-65"
      aria-labelledby="auctions-title"
    >
      <div className="mx-auto flex w-full max-w-350 flex-col gap-8 px-4 py-10 md:py-16">
        <div className="flex items-center justify-between">
          <h2
            className="text-xl font-bold text-[#121212] md:text-2xl xl:text-[30px]"
            id="auctions-title"
          >
            Live Auctions
          </h2>
          <Link
            to="/auction"
            className="flex items-center gap-1 text-sm font-semibold text-[#ad93e6]"
          >
            See All
            <img
              src="https://www.figma.com/api/mcp/asset/848cbe91-fa3a-4f7e-bfd1-fd84a13d21be"
              alt=""
              aria-hidden="true"
              className="h-4 w-4"
            />
          </Link>
        </div>

        <div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          role="list"
        >
          {auctions.map((auction) => (
            <AuctionCard
              key={`${auction.artist}-${auction.name}`}
              {...auction}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AuctionsSection;
