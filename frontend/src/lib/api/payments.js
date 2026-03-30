import api from "../axiosInstance";

/** Create VNPay payment for an auction won by the user */
export function createAuctionPayment({ auctionId, shippingInfo }) {
  return api.post("/api/payments/vnpay/auctions/create", { auctionId, shippingInfo });
}

/** Create VNPay payment for boosting one listing item */
export function createProductBoostPayment({ productId }) {
  return api.post("/api/payments/vnpay/boosts/create", { productId });
}
