import { memo } from "react";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatters";

const TrashIcon = () => (
  <svg
    className="h-3.5 w-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    />
  </svg>
);

/**
 * Sticky order-summary panel for the checkout page.
 * Consumes cart state via `useCart` — no prop drilling needed.
 */
const OrderSummary = memo(function OrderSummary() {
  const { items, removeItem, subtotal } = useCart();

  return (
    <aside
      className="w-full lg:w-80 xl:w-96 lg:sticky lg:top-24"
      aria-label="Order summary"
    >
      <div className="rounded-2xl border border-[#e6e6e6] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <h2 className="mb-5 text-base font-bold text-[#121212]">
          Order Summary
        </h2>

        {/* Item list */}
        {items.length === 0 && (
          <p className="mb-5 text-center text-sm text-[#b3b3b3]">
            Your cart is empty.
          </p>
        )}
        <ul className="mb-5 flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#e6e6e6] bg-[#f4f3f7]">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ad93e6]">
                  {item.artist}
                </span>
                <span className="truncate text-xs font-medium text-[#121212]">
                  {item.name}
                </span>
                <span className="text-[10px] text-[#737373]">
                  Qty: {item.qty}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-bold text-[#121212]">
                  {formatCurrency(item.price)}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="flex h-5 w-5 items-center justify-center rounded text-[#b3b3b3] transition-colors hover:text-[#ef4343]"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Totals */}
        <div className="flex flex-col gap-2 border-t border-[#e6e6e6] pt-4">
          <div className="flex justify-between text-base font-bold text-[#121212]">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
});

export default OrderSummary;
