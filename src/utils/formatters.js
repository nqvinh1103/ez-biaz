/**
 * Formats a number as USD currency.
 * @param {number} amount
 * @returns {string}  e.g. "$59.99"
 */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

/**
 * Left-pads a number with zeros to a minimum width of 2.
 * @param {number} n
 * @returns {string}  e.g.  pad(5) → "05"
 */
export const pad = (n) => String(Math.max(0, n)).padStart(2, "0");
