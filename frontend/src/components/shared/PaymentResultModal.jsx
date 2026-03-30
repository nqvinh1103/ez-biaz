import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/formatters";

/* ── Helpers ────────────────────────────────────────────────────────────── */
function parseVnpDate(str) {
  // VNPay format: YYYYMMDDHHMMSS
  if (!str || str.length < 14) return null;
  const iso = `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function DetailRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-[#737373]">{label}</span>
      <span className={`font-semibold ${accent ? "text-[#ad93e6]" : "text-[#121212]"}`}>
        {value}
      </span>
    </div>
  );
}

/* ── Type-specific config ───────────────────────────────────────────────── */
const TYPE_CFG = {
  checkout: {
    successTitle: "Order Placed!",
    successDesc: "Payment successful. Your order is now being processed.",
    failureDesc: "Your payment could not be completed. No charges were made.",
    successActions: [
      { label: "View My Orders", to: "/profile/order-history", primary: true },
      { label: "Continue Shopping", to: "/fandoms", primary: false },
    ],
  },
  subscription: {
    successTitle: "Subscription Activated!",
    successDesc: "Your plan has been activated successfully.",
    failureDesc: "Your subscription payment could not be completed.",
    successActions: [
      { label: "Go to Home", to: "/", primary: true },
      { label: "View Plans", to: "/subscription", primary: false },
    ],
  },
  auction: {
    successTitle: "Payment Successful!",
    successDesc: "Your auction payment was received. Your order is being processed.",
    failureDesc: "Your auction payment could not be completed. Please try again.",
    successActions: [
      { label: "View My Orders", to: "/profile/order-history", primary: true },
      { label: "Won Auctions", to: "/profile/won-auctions", primary: false },
    ],
  },
};

/* ── Component ──────────────────────────────────────────────────────────── */
/**
 * @param {object} props
 * @param {"checkout"|"subscription"|"auction"} props.type
 * @param {Record<string,string>} props.params  - raw VNPay query params from URL
 * @param {() => void} props.onClose
 */
export default function PaymentResultModal({ type, params, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isSuccess = params?.payment === "success";
  const cfg = TYPE_CFG[type] ?? TYPE_CFG.checkout;

  const amount = params?.vnp_Amount ? Number(params.vnp_Amount) / 100 : null;
  const transactionNo = params?.vnp_TransactionNo ?? null;
  const bankCode = params?.vnp_BankCode ?? null;
  const payDate = params?.vnp_PayDate ? parseVnpDate(params.vnp_PayDate) : null;
  const errorCode = params?.code ?? params?.vnp_ResponseCode ?? null;
  const hasDetails = isSuccess && (amount || transactionNo || bankCode || payDate);

  // Clean VNPay params from URL immediately so refreshing doesn't re-trigger
  useEffect(() => {
    navigate(location.pathname, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Close button */}
        <div className="flex justify-end px-5 pt-5">
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#737373] transition-colors hover:bg-[#f0f0f0]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-7 pt-2 text-center">
          {/* Status icon */}
          <div
            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              isSuccess ? "bg-[rgba(34,197,94,0.12)]" : "bg-[rgba(239,68,68,0.1)]"
            }`}
          >
            {isSuccess ? (
              <svg className="h-10 w-10 text-[#22c55e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : (
              <svg className="h-10 w-10 text-[#ef4444]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-[#121212]">
            {isSuccess ? cfg.successTitle : "Payment Failed"}
          </h2>
          <p className="mt-1.5 text-sm text-[#737373]">
            {isSuccess ? cfg.successDesc : cfg.failureDesc}
          </p>

          {/* Transaction details card (success) */}
          {hasDetails && (
            <div className="mt-5 rounded-xl border border-[#e6e6e6] bg-[#fafafa] px-4 py-1 text-left">
              <p className="mb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-[#b3b3b3]">
                Transaction Details
              </p>
              <div className="divide-y divide-[#f0f0f0]">
                {amount && <DetailRow label="Amount" value={formatCurrency(amount)} accent />}
                {transactionNo && <DetailRow label="Transaction No." value={transactionNo} />}
                {bankCode && <DetailRow label="Bank" value={bankCode} />}
                {payDate && (
                  <DetailRow
                    label="Date"
                    value={payDate.toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                )}
              </div>
            </div>
          )}

          {/* Failure error code */}
          {!isSuccess && errorCode && (
            <p className="mt-3 text-xs text-[#b3b3b3]">
              Error code: <span className="font-medium">{errorCode}</span>
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            {isSuccess ? (
              cfg.successActions.map(({ label, to, primary }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={`inline-flex h-10 flex-1 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                    primary
                      ? "bg-[#ad93e6] text-white hover:bg-[#9d7ed9]"
                      : "border border-[#e6e6e6] text-[#737373] hover:border-[#ad93e6] hover:text-[#ad93e6]"
                  }`}
                >
                  {label}
                </Link>
              ))
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-[#ad93e6] text-sm font-semibold text-white transition-colors hover:bg-[#9d7ed9]"
                >
                  Try Again
                </button>
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-[#e6e6e6] text-sm font-medium text-[#737373] transition-colors hover:border-[#ad93e6] hover:text-[#ad93e6]"
                >
                  Contact Support
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
