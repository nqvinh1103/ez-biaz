import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import BackLink from "../components/ui/BackLink";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { useAuth } from "../hooks/useAuth";
import { createAuctionPayment, getMe, getWonAuctions } from "../lib/ezbiasApi";

function PayModal({ auction, onClose, onPaid }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const res = await getMe();
      if (!mounted) return;
      if (res.success) {
        setProfile(res.data);
        setForm({
          fullName: res.data?.fullName ?? "",
          email: res.data?.email ?? "",
          address: res.data?.address ?? "",
          city: res.data?.city ?? "",
          zip: res.data?.zip ?? "",
          phone: res.data?.phone ?? "",
        });
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handlePay = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createAuctionPayment({ auctionId: auction.id, shippingInfo: form });
      if (res.success) {
        const payUrl = res.data?.payUrl;
        if (payUrl) {
          onPaid?.();
          window.location.href = payUrl;
          return;
        }
        setError("Missing VNPay payUrl.");
      } else {
        setError(res.message ?? "Payment failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/45 px-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#e6e6e6] px-6 py-4">
          <h2 className="text-base font-bold text-[#121212]">Pay for auction</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-[#737373] hover:bg-[#f0f0f0]" aria-label="Close">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="mb-4 text-sm text-[#737373]">
            Auction: <span className="font-semibold text-[#121212]">{auction.name}</span>
          </p>

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Full Name" id="pay-fullName" name="fullName" value={form.fullName} onChange={handleChange} />
              <FormField label="Email" id="pay-email" name="email" value={form.email} onChange={handleChange} />
              <div className="sm:col-span-2">
                <FormField label="Address" id="pay-address" name="address" value={form.address} onChange={handleChange} />
              </div>
              <FormField label="City" id="pay-city" name="city" value={form.city} onChange={handleChange} />
              <FormField label="Zip" id="pay-zip" name="zip" value={form.zip} onChange={handleChange} />
              <FormField label="Phone" id="pay-phone" name="phone" value={form.phone} onChange={handleChange} />
            </div>
          )}

          {error && <p className="mt-4 text-sm text-[#ef4343]">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#e6e6e6] px-6 py-4">
          <button onClick={onClose} className="h-10 rounded-lg border border-[#e6e6e6] px-5 text-sm font-medium text-[#737373] hover:bg-[#f9f9f9]">Cancel</button>
          <Button type="button" disabled={submitting || loading} onClick={handlePay}>
            {submitting ? "Redirecting…" : "Pay with VNPay"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WonAuctionsPage() {
  const { user, isLoggedIn } = useAuth();
  const [pendingOnly, setPendingOnly] = useState(true);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getWonAuctions(user.id, { pendingPaymentOnly: pendingOnly });
      if (!mounted) return;
      if (res.success) setList(res.data ?? []);
      else setError(res.message ?? "Failed to load won auctions.");
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn, user?.id, pendingOnly]);

  const rows = useMemo(() => list ?? [], [list]);

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 md:py-14">
        <BackLink to="/profile" label="Back to Profile" />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#121212]">Won Auctions</h1>
          <p className="mt-1 text-sm text-[#737373]">Pay for auctions you won and track status.</p>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPendingOnly(true)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              pendingOnly
                ? "border-[#ad93e6] bg-[#ad93e6] text-white"
                : "border-[#e6e6e6] text-[#737373] hover:border-[#ad93e6] hover:text-[#ad93e6]"
            }`}
          >
            Awaiting payment
          </button>
          <button
            type="button"
            onClick={() => setPendingOnly(false)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              !pendingOnly
                ? "border-[#ad93e6] bg-[#ad93e6] text-white"
                : "border-[#e6e6e6] text-[#737373] hover:border-[#ad93e6] hover:text-[#ad93e6]"
            }`}
          >
            All won
          </button>
        </div>

        {error && <p className="py-4 text-center text-sm text-[#ef4343]">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#737373]">No auctions found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-xl border border-[#e6e6e6] bg-white p-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#f0f0f0] bg-[#f7f6fb]">
                  <img src={a.image} alt={a.name} className="h-full w-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={a.status === "ended_pending_payment" ? "urgent" : "default"} dot>
                      {a.status}
                    </Badge>
                  </div>
                  <p className="truncate text-sm font-semibold text-[#121212]">{a.name}</p>
                  <p className="mt-1 text-xs text-[#737373]">
                    Final: <span className="font-medium text-[#121212]">{a.finalPrice ?? a.currentBid}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/auction/${a.id}`} className="text-sm font-semibold text-[#ad93e6] hover:underline">
                    View
                  </Link>
                  {a.status === "ended_pending_payment" && (
                    <Button type="button" onClick={() => setPaying(a)}>
                      Pay
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {paying && (
          <PayModal
            auction={paying}
            onClose={() => setPaying(null)}
            onPaid={() => {}}
          />
        )}
      </div>
    </PageLayout>
  );
}
