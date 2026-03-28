import { forwardRef, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

const Header = forwardRef(function Header(
  { navLinks, onOpenLoginModal },
  signUpButtonRef,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const { user, logout, isLoggedIn } = useAuth();
  const { count } = useCart();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-100" ref={wrapperRef}>
      <header
        className="h-16.25 border-b border-[#e6e6e6] bg-white/60 backdrop-blur"
        role="banner"
      >
        <div className="mx-auto flex h-16 w-full max-w-480 items-center justify-between px-4 md:px-6 lg:px-24 xl:px-65">
          <Link to="/" className="flex items-center" aria-label="EZBias Home">
            <img
              className="h-14.5 w-18 object-contain mt-3"
              src="https://www.figma.com/api/mcp/asset/cf2b261e-fdfd-4fdc-ab07-b0105425e386"
              alt="EZBias logo"
            />
          </Link>

          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="whitespace-nowrap text-sm font-medium text-[#121212b3] transition-colors hover:text-[#121212]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                {/* ── Create Auction button ── */}
                <Link
                  to="/create-auction"
                  className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#ad93e6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#9d7ed9]"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Auction
                </Link>

                {/* ── Avatar + dropdown ── */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((p) => !p)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ring-2 ring-[#ad93e6] ring-offset-1 transition-transform hover:scale-105"
                    style={{ backgroundColor: user.avatarBg }}
                    aria-label="User menu"
                    aria-expanded={dropdownOpen}
                  >
                    {user.avatar}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-[#e6e6e6] bg-white shadow-lg">
                      <div className="border-b border-[#e6e6e6] px-4 py-3">
                        <p className="truncate text-sm font-semibold text-[#121212]">
                          {user.fullName}
                        </p>
                        <p className="truncate text-xs text-[#737373]">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/my-listings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#121212] transition-colors hover:bg-[rgba(173,147,230,0.06)]"
                      >
                        <svg
                          className="h-4 w-4 text-[#ad93e6]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                        My Listings
                      </Link>
                      <Link
                        to="/order-history"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#121212] transition-colors hover:bg-[rgba(173,147,230,0.06)]"
                      >
                        <svg
                          className="h-4 w-4 text-[#ad93e6]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                          />
                        </svg>
                        My Order History
                      </Link>
                      <Link
                        to="/subscription"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[#7c3aed] transition-colors hover:bg-[rgba(124,58,237,0.06)]"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Upgrade Plan
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-[#ef4343] transition-colors hover:bg-[rgba(239,67,67,0.06)]"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                ref={signUpButtonRef}
                className="hidden h-10 rounded-full border border-[#ad93e6] bg-white px-6 text-sm font-semibold text-[#ad93e6] transition-colors hover:bg-[#ad93e6] hover:text-white sm:inline-flex sm:items-center"
                onClick={onOpenLoginModal}
              >
                SIGN UP
              </button>
            )}
            <Link
              to="/checkout"
              className="relative flex h-9.25 w-9.25 items-center justify-center"
              aria-label={`View cart (${count} items)`}
            >
              <img
                src="https://www.figma.com/api/mcp/asset/206ee4f9-6927-48ea-9ad1-952f8c50c097"
                alt="Cart"
                className="h-9.25 w-9.25"
              />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#ad93e6] text-[10px] font-bold leading-none text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
            <button
              className="flex h-9 w-9 flex-col justify-center gap-1.25 p-1 lg:hidden"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              <span
                className={`block h-0.5 w-full rounded bg-[#121212] transition-all ${isOpen ? "translate-y-1.75 rotate-45" : ""}`}
              ></span>
              <span
                className={`block h-0.5 w-full rounded bg-[#121212] transition-all ${isOpen ? "opacity-0" : "opacity-100"}`}
              ></span>
              <span
                className={`block h-0.5 w-full rounded bg-[#121212] transition-all ${isOpen ? "-translate-y-1.75 -rotate-45" : ""}`}
              ></span>
            </button>
          </div>
        </div>
      </header>

      <nav
        className={`lg:hidden overflow-hidden bg-white/95 backdrop-blur transition-all duration-300 ${
          isOpen
            ? "max-h-75 border-t border-[#e6e6e6] px-4 py-4"
            : "max-h-0 px-4 py-0"
        }`}
        id="mobile-menu"
        aria-label="Mobile navigation"
      >
        {navLinks.map((link) => (
          <Link
            key={`mobile-${link.label}`}
            to={link.href}
            className="block border-b border-[#e6e6e6] py-2 text-base font-medium text-[#121212b3] last:border-b-0"
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {isLoggedIn ? (
          <div className="mt-2 border-t border-[#e6e6e6] pt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: user.avatarBg }}
              >
                {user.avatar}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#121212]">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-[#737373]">{user.email}</p>
              </div>
            </div>
            <Link
              to="/sell"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#ad93e6] text-sm font-semibold text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              List an Item for Sale
            </Link>
            <Link
              to="/create-auction"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#ad93e6] text-sm font-semibold text-[#ad93e6]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.042 21.672L13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59"
                />
              </svg>
              Create Auction
            </Link>
            <Link
              to="/subscription"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#ad93e6] text-sm font-semibold text-white"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Upgrade Plan
            </Link>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#ef4343] text-sm font-semibold text-[#ef4343]"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            className="mt-2 inline-flex h-10 items-center justify-center rounded-full border border-[#ad93e6] bg-white px-6 text-sm font-semibold text-[#ad93e6]"
            onClick={() => {
              setIsOpen(false);
              onOpenLoginModal?.();
            }}
          >
            SIGN UP
          </button>
        )}
      </nav>
    </div>
  );
});

export default Header;
