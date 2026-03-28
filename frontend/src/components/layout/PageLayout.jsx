import { memo } from "react";
import { navLinks } from "../../data/landingData";
import { useLoginModal } from "../../context/LoginModalContext";
import Footer from "./Footer";
import Header from "./Header";

/**
 * Standard page shell: sticky Header + <main> content area + Footer.
 * Opens the login modal via LoginModalContext — no prop drilling needed.
 *
 * @param {{
 *   children: React.ReactNode,
 *   headerRef?: React.Ref,
 *   mainClassName?: string,
 * }} props
 */
const PageLayout = memo(function PageLayout({
  children,
  headerRef,
  mainClassName,
}) {
  const { openLoginModal } = useLoginModal();

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
