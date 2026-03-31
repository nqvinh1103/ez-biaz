import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import BackLink from "../components/ui/BackLink";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import AuctionWonModal from "../components/shared/AuctionWonModal";
import { useAuth } from "../hooks/useAuth";
import { getWonAuctions } from "../lib/ezbiasApi";

/* STATUS ──────────────────────────────────────────────────────────────────── */
const STATUS_TRANSLATIONS = {
  live: "Live",
  ended_no_winner: "Ended - No Winner",
  ended_pending_payment: "Pending Payment",
  winner_failed: "Winner Failed",
  sold: "Sold",
  canceled: "Canceled",
};

const getStatusLabel = (status) => STATUS_TRANSLATIONS[status] || status;

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
      const res = await getWonAuctions(user.id, {
        pendingPaymentOnly: pendingOnly,
      });
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
          <p className="mt-1 text-sm text-[#737373]">
            Pay for auctions you won and track status.
          </p>
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

        {error && (
          <p className="py-4 text-center text-sm text-[#ef4343]">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#e6e6e6] border-t-[#ad93e6]" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#737373]">
            No auctions found.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 rounded-xl border border-[#e6e6e6] bg-white p-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#f0f0f0] bg-[#f7f6fb]">
                  <img
                    src={a.image}
                    alt={a.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge
                      variant={
                        a.status === "ended_pending_payment"
                          ? "urgent"
                          : "default"
                      }
                      dot
                    >
                      {getStatusLabel(a.status)}
                    </Badge>
                  </div>
                  <p className="truncate text-sm font-semibold text-[#121212]">
                    {a.name}
                  </p>
                  <p className="mt-1 text-xs text-[#737373]">
                    Final:{" "}
                    <span className="font-medium text-[#121212]">
                      {a.finalPrice ?? a.currentBid}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/auction/${a.id}`}
                    className="text-sm font-semibold text-[#ad93e6] hover:underline"
                  >
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
          <AuctionWonModal
            auction={paying}
            onClose={() => setPaying(null)}
          />
        )}
      </div>
    </PageLayout>
  );
}
