import { useEffect, useMemo, useRef, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import LoginModal from "../components/modals/LoginModal";
import RegisterModal from "../components/modals/RegisterModal";
import AuctionsSection from "../components/sections/AuctionsSection";
import HeroSection from "../components/sections/HeroSection";
import TrendingSection from "../components/sections/TrendingSection";
import { getAuctions, getProducts } from "../lib/ezbiasApi";
import { useModal } from "../hooks/useModal";

function formatTimer(endsAt) {
  const end = new Date(endsAt).getTime();
  const diff = Math.max(0, end - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function LandingPage() {
  const login = useModal();
  const register = useModal();

  // Restore focus to the Sign Up button when modals close
  const signUpButtonRef = useRef(null);

  const [trending, setTrending] = useState([]);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Trending: take latest in-stock products
      const productsRes = await getProducts({ inStockOnly: true });
      if (mounted && productsRes.success) {
        setTrending((productsRes.data ?? []).slice(0, 8));
      }

      // Live auctions: take first 3
      const auctionsRes = await getAuctions({ isLive: true });
      if (mounted && auctionsRes.success) {
        setAuctions((auctionsRes.data ?? []).slice(0, 3));
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const trendingCards = useMemo(
    () =>
      trending.map((p) => ({
        id: p.id,
        artist: p.artist,
        name: p.name,
        price: p.price,
        image: p.image,
      })),
    [trending],
  );

  const auctionCards = useMemo(
    () =>
      auctions.map((a) => ({
        id: a.id,
        artist: a.artist,
        name: a.name,
        currentBid: a.currentBid,
        timer: formatTimer(a.endsAt),
        isUrgent: a.isUrgent,
        image: a.image,
        containImage: a.containImage,
      })),
    [auctions],
  );

  const handleOpenRegisterFromLogin = () => {
    login.close();
    register.open();
  };

  const handleOpenLoginFromRegister = () => {
    register.close();
    login.open();
  };

  return (
    <PageLayout headerRef={signUpButtonRef} onOpenLoginModal={login.open}>
      <HeroSection />
      <TrendingSection products={trendingCards} />
      <AuctionsSection auctions={auctionCards} />

      <LoginModal
        isOpen={login.isOpen}
        onClose={login.close}
        onOpenRegister={handleOpenRegisterFromLogin}
        onRequestSignUpRefocus={() => signUpButtonRef.current?.focus()}
      />
      <RegisterModal
        isOpen={register.isOpen}
        onClose={register.close}
        onOpenLogin={handleOpenLoginFromRegister}
        onRequestSignUpRefocus={() => signUpButtonRef.current?.focus()}
      />
    </PageLayout>
  );
}

export default LandingPage;
