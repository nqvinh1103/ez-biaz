import { memo } from "react";
import { cn } from "../../utils/cn";

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const CodIcon = () => (
  <svg
    className="h-5 w-5 text-[#737373]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
    />
  </svg>
);

const BankIcon = () => (
  <svg
    className="h-5 w-5 text-[#737373]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
    />
  </svg>
);

const CardIcon = () => (
  <svg
    className="h-5 w-5 text-[#737373]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
    />
  </svg>
);

/* ─── Data ────────────────────────────────────────────────────────────────── */
const METHODS = [
  { id: "cod", label: "Cash on Delivery", Icon: CodIcon },
  { id: "bank", label: "Bank Transfer", Icon: BankIcon },
];
const PaymentSelector = memo(function PaymentSelector({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-4 text-base font-bold text-[#121212]">
        Payment Method
      </legend>

      <div className="flex flex-col gap-3" role="radiogroup">
        {METHODS.map(({ id, label, Icon }) => (
          <label
            key={id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors",
              value === id
                ? "border-[#ad93e6] bg-[rgba(173,147,230,0.06)]"
                : "border-[#e6e6e6] hover:border-[#ad93e6]",
            )}
          >
            <Icon />
            <span className="flex-1 text-sm font-medium text-[#121212]">
              {label}
            </span>
            <input
              type="radio"
              name="payment"
              value={id}
              checked={value === id}
              onChange={() => onChange(id)}
              className="h-4 w-4 accent-[#ad93e6]"
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
});

export default PaymentSelector;
