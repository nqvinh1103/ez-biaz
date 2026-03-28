import { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import AuctionsSection from "../components/sections/AuctionsSection";
import HeroSection from "../components/sections/HeroSection";
import TrendingSection from "../components/sections/TrendingSection";
import { useLoginModal } from "../context/LoginModalContext";
import { getAuctions, getProducts } from "../lib/ezbiasApi";

function formatTimer(endsAt) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function LandingPage() {
  const { openLoginModal } = useLoginModal();
  const [trending, setTrending] = useState([]);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [productsRes, auctionsRes] = await Promise.all([
        getProducts({ inStockOnly: true }),
        getAuctions({ isLive: true }),
      ]);
      if (!mounted) return;
      if (productsRes.success) setTrending((productsRes.data ?? []).slice(0, 8));
      if (auctionsRes.success) setAuctions((auctionsRes.data ?? []).slice(0, 3));
    })();
    return () => { mounted = false; };
  }, []);

  const trendingCards = useMemo(
    () => trending.map((p) => ({ id: p.id, artist: p.artist, name: p.name, price: p.price, image: p.image })),
    [trending],
  );

  const auctionCards = useMemo(
    () => auctions.map((a) => ({
      id: a.id, artist: a.artist, name: a.name,
      currentBid: a.currentBid, timer: formatTimer(a.endsAt),
      isUrgent: a.isUrgent, image: a.image, containImage: a.containImage,
    })),
    [auctions],
  );

  return (
    <PageLayout onOpenLoginModal={openLoginModal}>
      <HeroSection />
      <TrendingSection products={trendingCards} />
      <AuctionsSection auctions={auctionCards} />
    </PageLayout>
  );
}

export default LandingPage;
