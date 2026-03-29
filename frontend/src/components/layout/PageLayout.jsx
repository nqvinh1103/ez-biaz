import { memo } from "react";
import { navLinks } from "../../data/landingData";
import { useLoginModal } from "../../context/LoginModalContext";
import { useNestedLayout } from "../../context/NestedLayoutContext";
import Footer from "./Footer";
import Header from "./Header";

/**
 * Standard page shell: sticky Header + <main> content area + Footer.
 * Khi render bên trong ProfilePage (nested route), tự động bỏ Header/Footer.
 */
const PageLayout = memo(function PageLayout({
  children,
  headerRef,
  mainClassName,
}) {
  const { openLoginModal } = useLoginModal();
  const isNested = useNestedLayout();

  if (isNested) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen min-w-[320px] bg-white font-['Inter'] text-[#121212]">
      <Header
        ref={headerRef}
        navLinks={navLinks}
        onOpenLoginModal={openLoginModal}
      />
      <main className={mainClassName ?? ""}>
        {children}
      </main>
      <Footer navLinks={navLinks} />
    </div>
  );
});

export default PageLayout;
