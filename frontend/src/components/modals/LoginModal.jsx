import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";

function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
  onRequestSignUpRefocus,
}) {
  const overlayRef = useRef(null);
  const closeButtonRef = useRef(null);
  const { login, loading, error, clearError } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const focusableSelector = useMemo(
    () =>
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    clearError();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      setEmail("");
      setPassword("");
      onClose();
      showToast("Welcome back! You're now logged in.");
    }
  };

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
      aria-labelledby="modal-title"
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

        <form
          onSubmit={handleSubmit}
          className="relative flex flex-1 flex-col items-center justify-center rounded-b-xl bg-[#fcfeff] px-6 pb-7 pt-8 md:rounded-r-xl md:rounded-bl-none md:px-10 md:pb-9 md:pt-12"
        >
          <button
            ref={closeButtonRef}
            className="absolute right-3.25 top-4.25 flex h-4.25 w-4.5 items-center justify-center p-0"
            aria-label="Close login modal"
            onClick={onClose}
          >
            <img
              src="https://www.figma.com/api/mcp/asset/43e47ff3-bb45-4573-9c04-6da88513d632"
              alt="Close"
              className="h-full w-full object-contain"
            />
          </button>

          <h2
            id="modal-title"
            className="mb-8.5 ml-px font-['Poppins'] text-[13px] justify-center font-semibold text-black"
          >
            Login your Account
          </h2>

          <div className="mb-4.5 w-full md:w-75">
            <label
              htmlFor="login-email"
              className="mb-1.5 block font-['Poppins'] text-[10px] font-medium text-[#7c838a]"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your Email here"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-[32.5px] w-full rounded-[10px] border-none bg-[rgba(176,186,195,0.4)] px-5 font-['Poppins'] text-[10px] text-black/80 outline-none focus:ring-2 focus:ring-[rgba(155,132,236,0.4)]"
            />
          </div>

          <div className="mb-4.5 w-full md:w-75">
            <label
              htmlFor="login-password"
              className="mb-1.5 block font-['Poppins'] text-[10px] font-medium text-[#7c838a]"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your Password here"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-[32.5px] w-full rounded-[10px] border-none bg-[rgba(176,186,195,0.4)] px-5 font-['Poppins'] text-[10px] text-black/80 outline-none focus:ring-2 focus:ring-[rgba(155,132,236,0.4)]"
            />
          </div>

          {error && (
            <p className="mb-2 w-full text-center font-['Poppins'] text-[10px] text-red-500 md:w-75">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mb-5 mt-2 h-7.5 w-full rounded-[5px] bg-[#9b84ec] font-['Poppins'] text-[13px] font-medium text-black transition-colors hover:bg-[#8a72db] disabled:opacity-60 md:w-42.5 mx-auto"
          >
            {loading ? "Logging in…" : "Login Account"}
          </button>

          <p className="mb-4.5 font-['Poppins'] text-[9px] text-[#7c838a]">
            Don&apos;t have a account?{" "}
            <button
              type="button"
              className="text-[#9b84ec]"
              onClick={() => {
                onClose();
                onOpenRegister?.();
              }}
            >
              Sign Up
            </button>
          </p>

          <div className="mb-5 mx-auto flex w-full flex-col gap-2.5 md:w-auto md:flex-row">
            <button
              type="button"
              className="inline-flex h-9 w-full items-center justify-center gap-1.75 rounded-[7.5px] border border-[#7c838a] px-2 text-[10px] font-medium text-[#7c838a] transition-colors hover:bg-[rgba(176,186,195,0.15)] md:h-6.75 md:w-auto md:justify-start md:text-[7px]"
            >
              <img
                src="https://www.figma.com/api/mcp/asset/8ce41974-1cb2-4b1b-9e76-0697d64e3edf"
                alt="Google logo"
                className="h-5.25 w-5.25 shrink-0 object-contain"
              />
              Sign up with Google
            </button>
            <p className="mb-4 font-['Poppins'] text-[13px] font-medium text-[#b0bac3]">
              - OR -
            </p>
            <button
              type="button"
              className="inline-flex h-9 w-full items-center justify-center gap-1.75 rounded-[7.5px] border border-[#7c838a] px-2 text-[10px] font-medium text-[#7c838a] transition-colors hover:bg-[rgba(176,186,195,0.15)] md:h-6.75 md:w-auto md:justify-start md:text-[7px]"
            >
              <img
                src="https://www.figma.com/api/mcp/asset/b44f0ac1-d43b-472e-a499-1789fcfa7f5a"
                alt="Facebook logo"
                className="h-5.25 w-5.25 shrink-0 object-contain"
              />
              Sign up with Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
