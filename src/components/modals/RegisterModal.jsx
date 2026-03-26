import { useEffect, useMemo, useRef } from "react";

function RegisterModal({
  isOpen,
  onClose,
  onOpenLogin,
  onRequestSignUpRefocus,
}) {
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);

  const focusableSelector = useMemo(
    () =>
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    [],
  );

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      onRequestSignUpRefocus?.();
    };
  }, [isOpen, onClose, onRequestSignUpRefocus]);

  const handleOverlayKeyDown = (event) => {
    if (event.key !== "Tab" || !overlayRef.current) return;

    const focusable = overlayRef.current.querySelectorAll(focusableSelector);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
      className={`fixed inset-0 z-200 flex items-center justify-center bg-black/45 px-4 transition-opacity duration-200 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={handleOverlayKeyDown}
    >
      <div
        className={`relative flex h-auto w-[95vw] max-w-180 flex-col overflow-hidden rounded-xl shadow-[0_4px_28.6px_-4px_rgba(0,0,0,0.16)] transition-all duration-200 md:h-128 md:flex-row ${
          isOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-[0.98]"
        }`}
      >
        <div className="relative h-35 w-full shrink-0 overflow-hidden bg-[#d9d9d9] md:h-auto md:w-74.25">
          <img
            className="h-full w-full object-cover object-left"
            src="https://www.figma.com/api/mcp/asset/8df5cd39-ac72-49df-852e-0a15da548014"
            alt="K-pop merchandise collage"
          />
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center rounded-b-xl bg-[#fcfeff] px-6 pb-7 pt-8 md:rounded-r-xl md:rounded-bl-none md:px-10 md:pb-9 md:pt-12">
          <button
            ref={closeButtonRef}
            className="absolute right-3.25 top-4.25 flex h-4.25 w-4.5 items-center justify-center p-0"
            aria-label="Close register modal"
            onClick={onClose}
          >
            <img
              src="https://www.figma.com/api/mcp/asset/43e47ff3-bb45-4573-9c04-6da88513d632"
              alt="Close"
              className="h-full w-full object-contain"
            />
          </button>

          <h2
            id="register-modal-title"
            className="mb-8.5 ml-px font-['Poppins'] text-[13px] font-semibold text-black"
          >
            Register your Account
          </h2>

          <div className="mb-4.5 w-full md:w-75">
            <label
              htmlFor="register-username"
              className="mb-1.5 block font-['Poppins'] text-[10px] font-medium text-[#7c838a]"
            >
              Username
            </label>
            <input
              id="register-username"
              type="text"
              placeholder="Enter your Username"
              autoComplete="username"
              className="h-[32.5px] w-full rounded-[10px] border-none bg-[rgba(176,186,195,0.4)] px-5 font-['Poppins'] text-[10px] text-black/80 outline-none focus:ring-2 focus:ring-[rgba(155,132,236,0.4)]"
            />
          </div>

          <div className="mb-4.5 w-full md:w-75">
            <label
              htmlFor="register-email"
              className="mb-1.5 block font-['Poppins'] text-[10px] font-medium text-[#7c838a]"
            >
              Email
            </label>
            <input
              id="register-email"
              type="email"
              placeholder="Enter your Email"
              autoComplete="email"
              className="h-[32.5px] w-full rounded-[10px] border-none bg-[rgba(176,186,195,0.4)] px-5 font-['Poppins'] text-[10px] text-black/80 outline-none focus:ring-2 focus:ring-[rgba(155,132,236,0.4)]"
            />
          </div>

          <div className="mb-4.5 w-full md:w-75">
            <label
              htmlFor="register-password"
              className="mb-1.5 block font-['Poppins'] text-[10px] font-medium text-[#7c838a]"
            >
              Password
            </label>
            <input
              id="register-password"
              type="password"
              placeholder="Enter your Password"
              autoComplete="new-password"
              className="h-[32.5px] w-full rounded-[10px] border-none bg-[rgba(176,186,195,0.4)] px-5 font-['Poppins'] text-[10px] text-black/80 outline-none focus:ring-2 focus:ring-[rgba(155,132,236,0.4)]"
            />
          </div>

          <div className="mb-4.5 w-full md:w-75">
            <label
              htmlFor="register-confirm-password"
              className="mb-1.5 block font-['Poppins'] text-[10px] font-medium text-[#7c838a]"
            >
              Confirm your Password
            </label>
            <input
              id="register-confirm-password"
              type="password"
              placeholder="Confirm your Password"
              autoComplete="new-password"
              className="h-[32.5px] w-full rounded-[10px] border-none bg-[rgba(176,186,195,0.4)] px-5 font-['Poppins'] text-[10px] text-black/80 outline-none focus:ring-2 focus:ring-[rgba(155,132,236,0.4)]"
            />
          </div>

          <button
            type="button"
            className="mb-5 mt-2 h-7.5 w-full rounded-[5px] bg-[#9b84ec] font-['Poppins'] text-[13px] font-medium text-black transition-colors hover:bg-[#8a72db] md:w-42.5"
          >
            Create Account
          </button>

          <p className="mb-4.5 text-center font-['Poppins'] text-[9px] text-[#7c838a]">
            Already have an account?{" "}
            <button
              type="button"
              className="text-[#9b84ec]"
              onClick={() => {
                onClose();
                onOpenLogin?.();
              }}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterModal;
