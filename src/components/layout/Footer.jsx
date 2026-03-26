import { Link } from "react-router-dom";

function Footer({ navLinks }) {
  return (
    <footer className="bg-[rgba(244,243,247,0.4)] px-4 md:px-6 lg:px-24">
      <div className="mx-auto flex w-full max-w-350 flex-col items-center justify-between gap-4 border-t border-[#e6e6e6] px-4 py-8 text-center md:gap-6 md:py-10 lg:flex-row lg:text-left">
        <Link to="/" className="text-xl font-extrabold text-[#ad93e6]">
          EZBias
        </Link>
        <nav
          className="flex flex-wrap items-center justify-center gap-6"
          aria-label="Footer navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={`footer-${link.label}`}
              to={link.href}
              className="text-sm text-[#737373] transition-colors hover:text-[#121212]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-[#737373]">
          Copyright 2026 EZBias. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
