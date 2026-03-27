import { memo, useEffect, useMemo, useState } from "react";
import ProductCard from "../components/cards/ProductCard";
import PageLayout from "../components/layout/PageLayout";
import { getProducts } from "../lib/ezbiasApi";
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
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // load tabs once
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getProducts();
      if (!mounted) return;
      if (!res.success) {
        setError(res.message ?? "Failed to load products.");
        setLoading(false);
        return;
      }

      const list = res.data ?? [];
      const fandoms = Array.from(new Set(list.map((p) => p.fandom))).sort();
      setTabs(fandoms);
      setActiveTab((prev) => prev || fandoms[0] || "");
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // load products per tab
  useEffect(() => {
    if (!activeTab) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getProducts({ fandom: activeTab });
      if (!mounted) return;
      if (res.success) setProducts(res.data ?? []);
      else setError(res.message ?? "Failed to load products.");
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [activeTab]);

  const filtered = useMemo(() => products, [products]);

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

        {tabs.length > 0 && (
          <FandomTabs tabs={tabs} active={activeTab} onSelect={setActiveTab} />
        )}

        {error && (
          <p className="py-4 text-center text-sm text-[#ef4343]">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
          </div>
        ) : filtered.length > 0 ? (
          <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
            role="list"
          >
            {filtered.map((product) => (
              <ProductCard key={product.id} {...product} />
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
