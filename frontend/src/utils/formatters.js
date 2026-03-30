/**
 * Formats a number as VNĐ currency.
 * @param {number} amount
 * @returns {string}  e.g. "8.000.000 VNĐ"
 */
export const formatCurrency = (amount) =>
  `${Math.round(Number(amount)).toLocaleString("vi-VN")} VND`;

/**
 * Left-pads a number with zeros to a minimum width of 2.
 * @param {number} n
 * @returns {string}  e.g.  pad(5) → "05"
 */
export const pad = (n) => String(Math.max(0, n)).padStart(2, "0");
