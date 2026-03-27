import { memo } from "react";
import { navLinks } from "../../data/landingData";
import Footer from "./Footer";
import Header from "./Header";

/**
 * Standard page shell: sticky Header + <main> content area + Footer.
 * Eliminates the boilerplate that was duplicated across all 8 pages.
 *
 * @param {{
 *   children: React.ReactNode,
 *   headerRef?: React.Ref,
 *   onOpenLoginModal?: () => void,
 *   mainClassName?: string,
 * }} props
 */
const PageLayout = memo(function PageLayout({
  children,
  headerRef,
  onOpenLoginModal,
  mainClassName,
}) {
  return (
    <div className="min-h-screen min-w-[320px] bg-white font-['Inter'] text-[#121212]">
      <Header
        ref={headerRef}
        navLinks={navLinks}
        onOpenLoginModal={onOpenLoginModal ?? (() => {})}
      />
      <main className={mainClassName ?? ""}>
        {children}
      </main>
      <Footer navLinks={navLinks} />
    </div>
  );
});

export default PageLayout;
