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

export function getOrders(userId) {
  return api.get(`/api/orders/${encodeURIComponent(userId)}`);
}

export function getSoldItems(sellerId) {
  return api.get(`/api/orders/seller/${encodeURIComponent(sellerId)}/sold`);
}

// export function getOrderHistory(userId) {
//   return api.get(`/api/orders/history/${encodeURIComponent(userId)}`);
// }
