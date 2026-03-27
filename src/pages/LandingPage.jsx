import { useRef } from "react";
import PageLayout from "../components/layout/PageLayout";
import LoginModal from "../components/modals/LoginModal";
import RegisterModal from "../components/modals/RegisterModal";
import AuctionsSection from "../components/sections/AuctionsSection";
import HeroSection from "../components/sections/HeroSection";
import TrendingSection from "../components/sections/TrendingSection";
import { trendingProducts } from "../data/landingData";
import { useModal } from "../hooks/useModal";

function LandingPage() {
  const login = useModal();
  const register = useModal();

  // Restore focus to the Sign Up button when modals close
  const signUpButtonRef = useRef(null);

  const handleOpenRegisterFromLogin = () => {
    login.close();
    register.open();
  };

  const handleOpenLoginFromRegister = () => {
    register.close();
    login.open();
  };

  return (
    <PageLayout
      headerRef={signUpButtonRef}
      onOpenLoginModal={login.open}
    >
      <HeroSection />
      <TrendingSection products={trendingProducts} />
      <AuctionsSection />

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
