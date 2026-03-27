import { memo, useState } from "react";
import ProductCard from "../components/cards/ProductCard";
import PageLayout from "../components/layout/PageLayout";
import { fandomProducts, fandomTabs } from "../data/landingData";
import { cn } from "../utils/cn";

/* ─── FandomTabs ──────────────────────────────────────────────────────────── */
const FandomTabs = memo(function FandomTabs({ tabs, active, onSelect }) {
  return (
    <div
      className="mb-8 flex flex-wrap gap-2"
      role="tablist"
      aria-label="Fandom filter"
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          onClick={() => onSelect(tab)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
            active === tab
              ? "bg-[#ad93e6] text-white"
              : "bg-[rgba(173,147,230,0.12)] text-[#ad93e6] hover:bg-[rgba(173,147,230,0.25)]",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
});

/* ─── Page ────────────────────────────────────────────────────────────────── */
function FandomsPage() {
  const [activeTab, setActiveTab] = useState(fandomTabs[0]);

  const filtered = fandomProducts.filter((p) => p.fandom === activeTab);

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-350 px-4 py-10 md:py-16">
        {/* Heading */}
        <div className="mb-8 flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#121212] md:text-3xl">
            Browse by Fandom
          </h1>
          <p className="text-sm text-[#737373]">
            Find merch from your favorite groups
          </p>
        </div>

        <FandomTabs
          tabs={fandomTabs}
          active={activeTab}
          onSelect={setActiveTab}
        />

        {/* Product grid */}
        {filtered.length > 0 ? (
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
            role="list"
          >
            {filtered.map((product) => (
              <ProductCard
                key={`${product.fandom}-${product.name}`}
                {...product}
              />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-[#737373]">
            No products found for this fandom yet.
          </p>
        )}
      </div>
    </PageLayout>
  );
}

export default FandomsPage;
