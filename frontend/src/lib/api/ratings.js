import api from "../axiosInstance";

/** Buyer submits a rating for an order */
export function submitRating({ orderId, sellerId, productRating, sellerRating, tags, comment }) {
  return api.post("/api/ratings", { orderId, sellerId, productRating, sellerRating, tags, comment });
}

/** Get all ratings received by a seller */
export function getSellerRatings(sellerId) {
  return api.get(`/api/ratings/seller/${encodeURIComponent(sellerId)}`);
}

/** Check if an order has already been rated */
export function checkOrderRated(orderId) {
  return api.get(`/api/ratings/order/${encodeURIComponent(orderId)}/check`);
}
