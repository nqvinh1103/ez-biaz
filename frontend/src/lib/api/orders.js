import api from "../axiosInstance";

export function checkout(
  userId,
  shippingInfo,
  paymentMethod,
  reactCartItems = null,
) {
  const items =
    Array.isArray(reactCartItems) && reactCartItems.length
      ? reactCartItems.map((i) => ({
          productId: i.id ?? i.productId,
          name: i.name,
          price: i.price,
          qty: i.qty ?? 1,
        }))
      : null;

  // VNPay flow: backend returns payUrl, frontend redirects.
  return api.post("/api/payments/vnpay/orders/create", {
    checkout: {
      userId,
      shippingInfo,
      paymentMethod,
      items,
    },
  });
}

/** Buyer: list all orders for a user */
export function getOrders(userId) {
  return api.get(`/api/orders/${encodeURIComponent(userId)}`);
}

/** Seller: list all orders assigned to this seller */
export function getSellerOrders(sellerId) {
  return api.get(`/api/orders/seller/${encodeURIComponent(sellerId)}`);
}

/** Seller: mark an order as shipped */
export function shipOrder(orderId, sellerId) {
  return api.post(`/api/orders/${encodeURIComponent(orderId)}/ship`, { sellerId });
}

/** Buyer: confirm order received */
export function receiveOrder(orderId, buyerId) {
  return api.post(`/api/orders/${encodeURIComponent(orderId)}/received`, { buyerId });
}

export function getSoldItems(sellerId) {
  return api.get(`/api/orders/seller/${encodeURIComponent(sellerId)}/sold`);
}
