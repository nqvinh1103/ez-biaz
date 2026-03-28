import api from "../axiosInstance";

export function getCart(userId) {
  return api.get(`/api/cart/${encodeURIComponent(userId)}`);
}

export function addToCart(userId, productId, qty = 1) {
  return api.post(`/api/cart/${encodeURIComponent(userId)}/items`, {
    productId,
    qty,
  });
}

export function updateCartQty(userId, productId, qty) {
  return api.put(
    `/api/cart/${encodeURIComponent(userId)}/items/${encodeURIComponent(productId)}`,
    { qty },
  );
}

export function removeFromCart(userId, productId) {
  return api.delete(
    `/api/cart/${encodeURIComponent(userId)}/items/${encodeURIComponent(productId)}`,
  );
}

export function clearCart(userId) {
  return api.delete(`/api/cart/${encodeURIComponent(userId)}`);
}
