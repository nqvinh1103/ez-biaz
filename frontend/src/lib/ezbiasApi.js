/*
 * ezbiasApi.js
 * Thin client for EzBias backend.
 * Keeps the same response shape as mockApi.js:
 *   { success: boolean, data: any, message: string }
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5171";

function ok(data, message = "Success") {
  return { success: true, data, message };
}

function fail(message, data = null) {
  return { success: false, data, message };
}

function readJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request(method, path, body = null, { token } = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : null,
    });

    const text = await res.text();
    const json = readJsonSafe(text);

    // Backend uses ApiResponse<T>
    if (json && typeof json.success === "boolean") {
      return json;
    }

    if (!res.ok) {
      return fail(json?.message ?? `Request failed (${res.status}).`);
    }

    // Fallback: return raw json/text
    return ok(json ?? text);
  } catch (err) {
    return fail(err?.message ?? "Network error: request failed.");
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   AUTH
────────────────────────────────────────────────────────────────────────── */
export async function login(email, password) {
  if (!email || !password) return fail("Email and password are required.");
  return request("POST", "/api/auth/login", { email, password });
}

export async function register(userData) {
  return request("POST", "/api/auth/register", userData);
}

/* ──────────────────────────────────────────────────────────────────────────
   PRODUCTS
────────────────────────────────────────────────────────────────────────── */
export async function getProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.fandom) params.set("fandom", filters.fandom);
  if (filters.type) params.set("type", filters.type);
  if (filters.minPrice !== undefined && filters.minPrice !== null)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined && filters.maxPrice !== null)
    params.set("maxPrice", String(filters.maxPrice));
  if (filters.inStockOnly) params.set("inStockOnly", "true");

  const qs = params.toString();
  return request("GET", `/api/products${qs ? `?${qs}` : ""}`);
}

export async function getProductById(id) {
  return request("GET", `/api/products/${encodeURIComponent(id)}`);
}

/* ──────────────────────────────────────────────────────────────────────────
   AUCTIONS
────────────────────────────────────────────────────────────────────────── */
export async function getAuctions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.fandom) params.set("fandom", filters.fandom);
  if (filters.isLive !== undefined) params.set("isLive", String(filters.isLive));
  if (filters.isUrgent) params.set("isUrgent", "true");
  const qs = params.toString();
  return request("GET", `/api/auctions${qs ? `?${qs}` : ""}`);
}

export async function getAuctionById(id) {
  return request("GET", `/api/auctions/${encodeURIComponent(id)}`);
}

export async function placeBid(userId, auctionId, amount) {
  return request("POST", `/api/auctions/${encodeURIComponent(auctionId)}/bids`, {
    userId,
    amount,
  });
}

/* ──────────────────────────────────────────────────────────────────────────
   CHECKOUT / ORDERS
────────────────────────────────────────────────────────────────────────── */
export async function checkout(userId, shippingInfo, paymentMethod, reactCartItems = null) {
  const items = Array.isArray(reactCartItems) && reactCartItems.length
    ? reactCartItems.map((i) => ({
        productId: i.id ?? i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty ?? 1,
      }))
    : null;

  return request("POST", "/api/orders/checkout", {
    userId,
    shippingInfo,
    paymentMethod,
    items,
  });
}

export async function getOrders(userId) {
  return request("GET", `/api/orders/${encodeURIComponent(userId)}`);
}

/* ──────────────────────────────────────────────────────────────────────────
   LISTINGS (Sell / My Listings)
────────────────────────────────────────────────────────────────────────── */
export async function getListingsByUser(userId) {
  return request("GET", `/api/products/seller/${encodeURIComponent(userId)}`);
}

export async function createListing(userId, listingData) {
  return request("POST", `/api/products/seller/${encodeURIComponent(userId)}`, listingData);
}

export async function updateListing(userId, productId, updates) {
  return request(
    "PUT",
    `/api/products/seller/${encodeURIComponent(userId)}/${encodeURIComponent(productId)}`,
    updates,
  );
}

export async function deleteListing(userId, productId) {
  return request(
    "DELETE",
    `/api/products/seller/${encodeURIComponent(userId)}/${encodeURIComponent(productId)}`,
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   CART (server-side)
────────────────────────────────────────────────────────────────────────── */
export async function getCart(userId) {
  return request("GET", `/api/cart/${encodeURIComponent(userId)}`);
}

export async function addToCart(userId, productId, qty = 1) {
  return request("POST", `/api/cart/${encodeURIComponent(userId)}/items`, {
    productId,
    qty,
  });
}

export async function updateCartQty(userId, productId, qty) {
  return request("PUT", `/api/cart/${encodeURIComponent(userId)}/items/${encodeURIComponent(productId)}`, {
    qty,
  });
}

export async function removeFromCart(userId, productId) {
  return request("DELETE", `/api/cart/${encodeURIComponent(userId)}/items/${encodeURIComponent(productId)}`);
}

export async function clearCart(userId) {
  return request("DELETE", `/api/cart/${encodeURIComponent(userId)}`);
}

/* ──────────────────────────────────────────────────────────────────────────
   CONTACT
────────────────────────────────────────────────────────────────────────── */
export async function sendContactMessage(name, email, message) {
  return request("POST", "/api/contact", { name, email, message });
}
