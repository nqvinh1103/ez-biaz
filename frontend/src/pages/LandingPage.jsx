import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import AuctionsSection from "../components/sections/AuctionsSection";
import HeroSection from "../components/sections/HeroSection";
import TrendingSection from "../components/sections/TrendingSection";
import PaymentResultModal from "../components/shared/PaymentResultModal";
import { useLoginModal } from "../context/LoginModalContext";
import { getAuctions, getProducts } from "../lib/ezbiasApi";

function formatTimer(endsAt, nowMs) {
  const diff = Math.max(0, new Date(endsAt).getTime() - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  if (totalSeconds <= 0) return "Ended";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function LandingPage() {
  const { openLoginModal } = useLoginModal();
  const [searchParams] = useSearchParams();
  const [trending, setTrending] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [paymentResult, setPaymentResult] = useState(null);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [productsRes, auctionsRes] = await Promise.all([
        getProducts({ inStockOnly: true, boostedFirst: true }),
        getAuctions({ isLive: true }),
      ]);
      if (!mounted) return;
      if (productsRes.success) setTrending((productsRes.data ?? []).slice(0, 8));
      if (auctionsRes.success) setAuctions((auctionsRes.data ?? []).slice(0, 3));
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const status = searchParams.get("payment");
    if (!status) return;
    setPaymentResult(Object.fromEntries(searchParams.entries()));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const trendingCards = useMemo(
    () => trending.map((p) => ({
      id: p.id,
      artist: p.artist,
      name: p.name,
      price: p.price,
      image: p.image,
      isBoosted: p.isBoosted,
      boostEndsAt: p.boostEndsAt,
    })),
    [trending],
  );

  const auctionCards = useMemo(
    () => auctions.map((a) => ({
      id: a.id, artist: a.artist, name: a.name,
      currentBid: a.currentBid, timer: formatTimer(a.endsAt, nowMs),
      isUrgent: a.isUrgent, image: a.image, containImage: a.containImage,
    })),
    [auctions, nowMs],
  );

  return (
    <PageLayout onOpenLoginModal={openLoginModal}>
      {paymentResult && (
        <PaymentResultModal
          type={paymentResult.type ?? "checkout"}
          params={paymentResult}
          onClose={() => setPaymentResult(null)}
        />
      )}
      <HeroSection />
      <TrendingSection products={trendingCards} />
      <AuctionsSection auctions={auctionCards} />
    </PageLayout>
  );
}

export default LandingPage;
