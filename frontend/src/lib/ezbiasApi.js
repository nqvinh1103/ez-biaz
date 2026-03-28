/**
 * ezbiasApi.js
 * API client for EzBias backend using Axios.
 * All functions return: { success: boolean, data: any, message: string }
 */

import api from "./axiosInstance";

// ── Auth ──────────────────────────────────────────────────────────────────────

export function login(email, password) {
  return api.post("/api/auth/login", { email, password });
}

export function register(userData) {
  return api.post("/api/auth/register", userData);
}

// ── Products ──────────────────────────────────────────────────────────────────

export function getProducts(filters = {}) {
  const params = {};
  if (filters.fandom) params.fandom = filters.fandom;
  if (filters.type) params.type = filters.type;
  if (filters.minPrice != null) params.minPrice = filters.minPrice;
  if (filters.maxPrice != null) params.maxPrice = filters.maxPrice;
  if (filters.inStockOnly) params.inStockOnly = true;
  return api.get("/api/products", { params });
}

export function getProductById(id) {
  return api.get(`/api/products/${encodeURIComponent(id)}`);
}

// ── Auctions ──────────────────────────────────────────────────────────────────

export function getAuctions(filters = {}) {
  const params = {};
  if (filters.fandom) params.fandom = filters.fandom;
  if (filters.isLive !== undefined) params.isLive = filters.isLive;
  if (filters.isUrgent) params.isUrgent = true;
  return api.get("/api/auctions", { params });
}

export function getAuctionById(id) {
  return api.get(`/api/auctions/${encodeURIComponent(id)}`);
}

export function placeBid(userId, auctionId, amount) {
  return api.post(`/api/auctions/${encodeURIComponent(auctionId)}/bids`, {
    userId,
    amount,
  });
}

// ── Checkout / Orders ─────────────────────────────────────────────────────────

export function checkout(userId, shippingInfo, paymentMethod, reactCartItems = null) {
  const items =
    Array.isArray(reactCartItems) && reactCartItems.length
      ? reactCartItems.map((i) => ({
          productId: i.id ?? i.productId,
          name: i.name,
          price: i.price,
          qty: i.qty ?? 1,
        }))
      : null;

  return api.post("/api/orders/checkout", {
    userId,
    shippingInfo,
    paymentMethod,
    items,
  });
}

export function getOrders(userId) {
  return api.get(`/api/orders/${encodeURIComponent(userId)}`);
}

// ── Listings ──────────────────────────────────────────────────────────────────

export function getListingsByUser(userId) {
  return api.get(`/api/products/seller/${encodeURIComponent(userId)}`);
}

export function createListing(userId, listingData) {
  return api.post(`/api/products/seller/${encodeURIComponent(userId)}`, listingData);
}

export function updateListing(userId, productId, updates) {
  return api.put(
    `/api/products/seller/${encodeURIComponent(userId)}/${encodeURIComponent(productId)}`,
    updates,
  );
}

export function deleteListing(userId, productId) {
  return api.delete(
    `/api/products/seller/${encodeURIComponent(userId)}/${encodeURIComponent(productId)}`,
  );
}

// ── Cart ──────────────────────────────────────────────────────────────────────

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

// ── Contact ───────────────────────────────────────────────────────────────────

export function sendContactMessage(name, email, message) {
  return api.post("/api/contact", { name, email, message });
}
