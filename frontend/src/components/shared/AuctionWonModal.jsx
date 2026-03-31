import { useEffect, useState } from "react";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import { formatCurrency } from "../../utils/formatters";
import { createAuctionPayment, getMe } from "../../lib/ezbiasApi";

/* ── Trophy Icon ──────────────────────────────────────────────────────────── */
const TrophyIcon = () => (
  <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const VNPayIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

/* ── Modal ────────────────────────────────────────────────────────────────── */
/**
 * AuctionWonModal
 * Props:
 *   auction  – { id, name, image, currentBid, finalPrice }
 *   onClose  – () => void
 */
export default function AuctionWonModal({ auction, onClose }) {
  const [profile, setProfile]     = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [form, setForm] = useState({
    fullName: "", email: "", address: "", city: "", zip: "", phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  /* Pre-fill from profile */
  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getMe();
      if (!mounted) return;
      if (res.success && res.data) {
        setProfile(res.data);
        setForm({
          fullName: res.data.fullName ?? "",
          email:    res.data.email    ?? "",
          address:  res.data.address  ?? "",
          city:     res.data.city     ?? "",
          zip:      res.data.zip      ?? "",
          phone:    res.data.phone    ?? "",
        });
      }
      setLoadingProfile(false);
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handlePay = async () => {
    if (submitting) return;
    const required = ["fullName", "email", "address", "city", "phone"];
    const missing = required.find((k) => !form[k]?.trim());
    if (missing) { setError("Please fill in all required fields."); return; }

    setSubmitting(true);
    setError(null);
    try {
      const res = await createAuctionPayment({ auctionId: auction.id, shippingInfo: form });
      if (res.success) {
        const payUrl = res.data?.payUrl;
        if (payUrl) { window.location.href = payUrl; return; }
        setError("Missing VNPay payment URL.");
      } else {
        setError(res.message ?? "Payment failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const winningPrice = auction.finalPrice ?? auction.currentBid;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ── Celebration header ──────────────────────────────────────── */}
        <div
          className="relative flex flex-col items-center gap-2 overflow-hidden px-6 py-8 text-center text-white"
          style={{ background: "linear-gradient(135deg, #7c5cbf 0%, #ad93e6 100%)" }}
        >
          {/* Subtle radial glow */}
          <div className="pointer-events-none absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at 50% 0%, #fff 0%, transparent 70%)" }} />

          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
            <TrophyIcon />
          </div>
          <p className="relative z-10 mt-1 text-2xl font-bold tracking-tight">Congratulations! 🎉</p>
          <p className="relative z-10 text-sm text-white/80">You won this auction</p>

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={submitting}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Close"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Item summary ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 border-b border-[#f0f0f0] px-6 py-4">
          {auction.image && (
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#f0f0f0] bg-[#f7f6fb]">
              <img src={auction.image} alt={auction.name} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#121212]">{auction.name}</p>
            <p className="text-xs text-[#737373]">Winning bid</p>
          </div>
          <p className="shrink-0 text-lg font-bold text-[#ad93e6]">
            {winningPrice ? formatCurrency(winningPrice) : "—"}
          </p>
        </div>

        {/* ── Shipping form ────────────────────────────────────────────── */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: "50vh" }}>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#b3b3b3]">
            Shipping Details
          </p>

          {loadingProfile ? (
            <div className="flex justify-center py-8">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                label="Full Name *"
                id="won-fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Nguyen Van A"
              />
              <FormField
                label="Email *"
                id="won-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
              <div className="sm:col-span-2">
                <FormField
                  label="Address *"
                  id="won-address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Nguyen Hue, District 1"
                />
              </div>
              <FormField
                label="City *"
                id="won-city"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ho Chi Minh City"
              />
              <FormField
                label="Phone *"
                id="won-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0901 234 567"
              />
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-[#ef4343]">
              {error}
            </p>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-[#f0f0f0] px-6 py-4">
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-sm font-medium text-[#737373] transition-colors hover:text-[#121212] disabled:opacity-40"
          >
            Pay later
          </button>
          <Button
            onClick={handlePay}
            disabled={submitting || loadingProfile}
            className="gap-2"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Redirecting…
              </>
            ) : (
              <>
                <VNPayIcon />
                Pay with VNPay
                <ArrowRightIcon />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
