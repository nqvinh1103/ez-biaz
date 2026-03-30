import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import BackLink from "../components/ui/BackLink";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { getSellerAuctions, relistAuction } from "../lib/ezbiasApi";

const STATUS_LABEL = {
  live: "Live",
  ended_no_winner: "Ended (No winner)",
  ended_pending_payment: "Awaiting payment",
  winner_failed: "Winner failed",
  sold: "Sold",
  canceled: "Canceled",
};

function statusVariant(status, isLive) {
  if (isLive) return "live";
  if (status === "ended_pending_payment") return "urgent";
  if (status === "winner_failed") return "default";
  if (status === "ended_no_winner") return "default";
  if (status === "sold") return "default";
  return "default";
}

function canRelist(a) {
  if (!a) return false;
  if (a.isLive) return false;
  return ["ended_no_winner", "winner_failed"].includes(a.status);
}

export default function MyAuctionsPage() {
  const { user, isLoggedIn } = useAuth();
  const [status, setStatus] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relistingId, setRelistingId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn || !user?.id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getSellerAuctions(user.id, { status: status || undefined });
      if (!mounted) return;
      if (res.success) setList(res.data ?? []);
      else setError(res.message ?? "Failed to load your auctions.");
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [isLoggedIn, user?.id, status]);

  const rows = useMemo(() => list ?? [], [list]);

  const handleRelist = async (auctionId) => {
    if (!user?.id || !auctionId || relistingId) return;
    setRelistingId(auctionId);
    const res = await relistAuction(auctionId, {
      sellerId: user.id,
      durationSeconds: 30,
      isUrgent: false,
    });

    if (res.success) {
      const refresh = await getSellerAuctions(user.id, { status: status || undefined });
      if (refresh.success) setList(refresh.data ?? []);
      else setError(refresh.message ?? "Relisted, but failed to refresh list.");
    } else {
      setError(res.message ?? "Failed to relist auction.");
    }

    setRelistingId(null);
  };

  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 md:py-14">
        <BackLink to="/profile" label="Back to Profile" />

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#121212]">My Auctions</h1>
            <p className="mt-1 text-sm text-[#737373]">
              Track your auctions, winners, and payment status.
            </p>
          </div>
          <Link to="/create-auction">
            <Button type="button">Create Auction</Button>
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {["", "live", "ended_pending_payment", "winner_failed", "ended_no_winner", "sold"].map((s) => (
            <button
              key={s || "all"}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                status === s
                  ? "border-[#ad93e6] bg-[#ad93e6] text-white"
                  : "border-[#e6e6e6] text-[#737373] hover:border-[#ad93e6] hover:text-[#ad93e6]"
              }`}
            >
              {s ? (STATUS_LABEL[s] ?? s) : "All"}
            </button>
          ))}
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
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(a.status, a.isLive)} dot>
                      {a.isLive ? "LIVE" : (STATUS_LABEL[a.status] ?? a.status ?? "AUCTION")}
                    </Badge>
                    {a.isUrgent && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">Urgent</span>
                    )}
                  </div>

                  <p className="truncate text-sm font-semibold text-[#121212]">{a.name}</p>
                  <p className="mt-1 text-xs text-[#737373]">
                    Ends: <span className="font-medium text-[#121212]">{new Date(a.endsAt).toLocaleString()}</span>
                  </p>
                  {a.winnerId && (
                    <p className="mt-0.5 text-xs text-[#737373]">
                      Winner: <span className="font-medium text-[#121212]">{a.winnerId}</span>
                      {a.finalPrice != null && (
                        <> · Final: <span className="font-medium text-[#121212]">{a.finalPrice}</span></>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {canRelist(a) && (
                    <button
                      type="button"
                      onClick={() => handleRelist(a.id)}
                      disabled={relistingId === a.id}
                      className="rounded-lg border border-[#ad93e6] px-3 py-1.5 text-xs font-semibold text-[#ad93e6] hover:bg-[#f7f3ff] disabled:opacity-60"
                    >
                      {relistingId === a.id ? "Relisting..." : "Relist"}
                    </button>
                  )}

                  <Link to={`/auction/${a.id}`} className="text-sm font-semibold text-[#ad93e6] hover:underline">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
