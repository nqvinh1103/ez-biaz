import { useState } from "react";
import { Link } from "react-router-dom";
import { useLoginModal } from "../../context/LoginModalContext";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/formatters";

/** Renders a Link only when `to` is non-null, otherwise a plain fragment. */
function ConditionalLink({ to, children }) {
  return to ? <Link to={to}>{children}</Link> : <>{children}</>;
}

function ProductCard({ id, artist, name, price, image }) {
  const { isLoggedIn } = useAuth();
  const { openLoginModal } = useLoginModal();
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  // Fallback to name if id is missing (legacy static data without id)
  const itemKey = id ?? name;
  const inCart = items.some((i) => (i.id ?? i.name) === itemKey);

  const numericPrice = typeof price === "number"
    ? price
    : parseFloat(String(price).replace(" VNĐ", "").replace("VNĐ", ""));

  const displayPrice = typeof price === "number" ? formatCurrency(price) : price;

  const handleAdd = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    addItem({ id: itemKey, artist, name, price: numericPrice, image, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const detailHref = id ? `/product/${id}` : null;

  return (
    <article
      className="overflow-hidden rounded-xl border border-[rgba(230,230,230,0.5)] bg-white p-px shadow-[0_1px_2px_2px_rgba(0,0,0,0.09)]"
      role="listitem"
    >
      {/* Clickable image → detail page */}
      <ConditionalLink to={detailHref}>
        <div className="relative aspect-square w-full overflow-hidden">
          <img
            className="absolute inset-0 h-full w-full object-contain p-3 sm:object-cover sm:p-0 transition-transform duration-200 hover:scale-105"
            src={image}
            alt={name}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-[rgba(244,243,247,0)] to-[rgba(143,143,145,0.11)]"
            aria-hidden="true"
          ></div>
        </div>
      </ConditionalLink>

      <div className="flex flex-col gap-2 p-3 sm:p-4 xl:gap-1.5 xl:p-3">
        <p className="text-xs font-semibold uppercase leading-4 tracking-[0.6px] text-[#ad93e6] xl:text-[10px]">
          {artist}
        </p>
        {/* Clickable name → detail page */}
        <ConditionalLink to={detailHref}>
          <h3 className="text-sm font-semibold xl:min-h-11 text-[#121212] xl:text-[12px] hover:text-[#ad93e6] transition-colors">
            {name}
          </h3>
        </ConditionalLink>
        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between xl:pt-0.5">
          <span className="text-[30px] font-bold leading-none text-[#121212] sm:text-lg sm:leading-7 xl:text-[13px]">
            {displayPrice}
          </span>
          <button
            onClick={handleAdd}
            disabled={inCart}
            className="inline-flex h-8 shrink-0 items-center justify-center gap-1 self-end whitespace-nowrap rounded-full px-3 text-xs font-medium text-white transition-colors sm:self-auto xl:h-8 xl:gap-1 xl:px-2 xl:text-[11px] disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundColor: added ? "#22c55e" : inCart ? "#b3b3b3" : "#ad93e6" }}
            aria-label={`Add ${name} to cart`}
          >
            <img
              src="https://www.figma.com/api/mcp/asset/82477c67-1233-4111-bd0d-9c38a332680e"
              alt=""
              aria-hidden="true"
              className="h-3 w-3 shrink-0 xl:h-3.5 xl:w-3.5"
            />
            {added ? "Added!" : inCart ? "In cart" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
