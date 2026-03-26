/**
 * mockApi.js
 * Simulates a REST API with realistic delays and error handling.
 * All functions return:  { success: boolean, data: any, message: string }
 *
 * To swap for a real backend later, replace these functions with
 * fetch() / axios calls — the response shape stays the same.
 */

import { AUCTIONS, BID_HISTORY, CARTS, ORDERS, PRODUCTS, USERS } from "./mockData";

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */

/**
 * Simulates network latency (300–900 ms).
 * Pass { forceError: true } to simulate a network failure ~15 % of the time.
 */
function delay(ms = null, { forceError = false } = {}) {
  const wait = ms ?? Math.floor(Math.random() * 600 + 300);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (forceError && Math.random() < 0.15) {
        reject(new Error("Network error: request timed out."));
      } else {
        resolve();
      }
    }, wait);
  });
}

function ok(data, message = "Success") {
  return { success: true, data, message };
}

function fail(message, data = null) {
  return { success: false, data, message };
}

/* In-memory mutable state (deep-cloned so originals stay pristine) */
const _users = USERS.map((u) => ({ ...u }));
const _products = PRODUCTS.map((p) => ({ ...p }));
const _auctions = AUCTIONS.map((a) => ({ ...a }));
const _bids = Object.fromEntries(
  Object.entries(BID_HISTORY).map(([k, v]) => [k, v.map((b) => ({ ...b }))]),
);
const _carts = Object.fromEntries(
  Object.entries(CARTS).map(([k, v]) => [k, v.map((i) => ({ ...i }))]),
);
const _orders = ORDERS.map((o) => ({ ...o }));

/* ─────────────────────────────────────────────────────────────────────────────
   AUTH
───────────────────────────────────────────────────────────────────────────── */

/**
 * login(email, password)
 * Returns user object (without password) on success.
 *
 * Edge cases: wrong email, wrong password, missing fields.
 */
export async function login(email, password) {
  await delay();

  if (!email || !password) {
    return fail("Email and password are required.");
  }

  const user = _users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return fail("No account found with that email address.");
  }

  if (user.password !== password) {
    return fail("Incorrect password. Please try again.");
  }

  const { password: _pw, ...safeUser } = user;
  return ok(safeUser, "Login successful. Welcome back, " + safeUser.fullName + "!");
}

/**
 * register(userData)
 * Registers a new user account.
 *
 * Edge cases: duplicate email, missing required fields.
 */
export async function register(userData) {
  await delay();

  const { fullName, email, password, phone } = userData;

  if (!fullName || !email || !password) {
    return fail("Full name, email, and password are required.");
  }

  if (_users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return fail("An account with this email already exists.");
  }

  const newUser = {
    id: "u" + (_users.length + 1),
    fullName,
    username: email.split("@")[0],
    email,
    password,
    phone: phone ?? "",
    address: "",
    city: "",
    zip: "",
    avatar: fullName
      .split(" ")
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase(),
    avatarBg: "#ad93e6",
    joinedAt: new Date().toISOString().slice(0, 10),
    role: "buyer",
  };

  _users.push(newUser);
  const { password: _pw, ...safeUser } = newUser;
  return ok(safeUser, "Account created successfully!");
}

/* ─────────────────────────────────────────────────────────────────────────────
   USERS
───────────────────────────────────────────────────────────────────────────── */

/**
 * getUsers()
 * Returns all users (passwords stripped).
 */
export async function getUsers() {
  await delay();
  const safe = _users.map(({ password: _pw, ...u }) => u);
  return ok(safe);
}

/**
 * getUserById(id)
 */
export async function getUserById(id) {
  await delay();
  const user = _users.find((u) => u.id === id);
  if (!user) return fail("User not found.");
  const { password: _pw, ...safeUser } = user;
  return ok(safeUser);
}

/* ─────────────────────────────────────────────────────────────────────────────
   PRODUCTS
───────────────────────────────────────────────────────────────────────────── */

/**
 * getProducts(filters?)
 * Optional filters: { fandom, type, minPrice, maxPrice, inStockOnly }
 */
export async function getProducts(filters = {}) {
  await delay();

  let results = [..._products];

  if (filters.fandom) {
    results = results.filter(
      (p) => p.fandom.toLowerCase() === filters.fandom.toLowerCase(),
    );
  }

  if (filters.type) {
    results = results.filter(
      (p) => p.type.toLowerCase() === filters.type.toLowerCase(),
    );
  }

  if (filters.minPrice !== undefined) {
    results = results.filter((p) => p.price >= filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    results = results.filter((p) => p.price <= filters.maxPrice);
  }

  if (filters.inStockOnly) {
    results = results.filter((p) => p.stock > 0);
  }

  if (!results.length) {
    return ok([], "No products found for the selected filters.");
  }

  return ok(results);
}

/**
 * getProductById(id)
 */
export async function getProductById(id) {
  await delay();
  const product = _products.find((p) => p.id === id);
  if (!product) return fail("Product not found.");
  return ok(product);
}

/* ─────────────────────────────────────────────────────────────────────────────
   CART
───────────────────────────────────────────────────────────────────────────── */

/**
 * getCart(userId)
 * Returns enriched cart items (product details merged).
 */
export async function getCart(userId) {
  await delay();
  const cartItems = _carts[userId] ?? [];

  const enriched = cartItems.map((item) => {
    const product = _products.find((p) => p.id === item.productId);
    return product
      ? {
          productId: item.productId,
          qty: item.qty,
          name: product.name,
          artist: product.artist,
          fandom: product.fandom,
          price: product.price,
          image: product.image,
          stock: product.stock,
        }
      : null;
  }).filter(Boolean);

  return ok(enriched);
}

/**
 * addToCart(userId, productId, qty?)
 *
 * Edge cases: product not found, out of stock, already in cart (increments).
 */
export async function addToCart(userId, productId, qty = 1) {
  await delay();

  const product = _products.find((p) => p.id === productId);
  if (!product) return fail("Product not found.");
  if (product.stock === 0) return fail("Sorry, this item is out of stock.");
  if (qty < 1) return fail("Quantity must be at least 1.");

  if (!_carts[userId]) _carts[userId] = [];

  const existing = _carts[userId].find((i) => i.productId === productId);
  if (existing) {
    const newQty = existing.qty + qty;
    if (newQty > product.stock) {
      return fail(`Only ${product.stock} unit(s) available. You already have ${existing.qty} in cart.`);
    }
    existing.qty = newQty;
  } else {
    _carts[userId].push({ productId, qty });
  }

  return ok({ productId, qty: existing ? existing.qty : qty }, "Item added to cart.");
}

/**
 * removeFromCart(userId, productId)
 */
export async function removeFromCart(userId, productId) {
  await delay(300);

  if (!_carts[userId]) return fail("Cart not found.");
  const before = _carts[userId].length;
  _carts[userId] = _carts[userId].filter((i) => i.productId !== productId);

  if (_carts[userId].length === before) return fail("Item not found in cart.");
  return ok(null, "Item removed from cart.");
}

/**
 * updateCartQty(userId, productId, qty)
 */
export async function updateCartQty(userId, productId, qty) {
  await delay(300);

  if (qty < 1) return fail("Quantity must be at least 1.");

  const product = _products.find((p) => p.id === productId);
  if (!product) return fail("Product not found.");
  if (qty > product.stock) return fail(`Only ${product.stock} unit(s) available.`);

  const item = (_carts[userId] ?? []).find((i) => i.productId === productId);
  if (!item) return fail("Item not found in cart.");

  item.qty = qty;
  return ok({ productId, qty }, "Cart updated.");
}

/* ─────────────────────────────────────────────────────────────────────────────
   CHECKOUT / ORDERS
───────────────────────────────────────────────────────────────────────────── */

/**
 * checkout(userId, shippingInfo, paymentMethod, reactCartItems)
 *
 * reactCartItems: items array from React CartContext (each has id, name, price, qty).
 * Falls back to _carts[userId] if not provided (legacy path).
 *
 * Edge cases: empty cart, missing shipping info.
 */
export async function checkout(userId, shippingInfo, paymentMethod, reactCartItems = null) {
  await delay(800, { forceError: true }); // slightly higher delay + possible network error

  // Prefer React cart items passed directly; fall back to mock DB cart
  const usingReactItems = Array.isArray(reactCartItems) && reactCartItems.length > 0;
  const rawCart = usingReactItems ? reactCartItems : (_carts[userId] ?? []);

  if (!rawCart.length) {
    return fail("Your cart is empty. Add items before checking out.");
  }

  // Validate shipping
  const required = ["fullName", "email", "address", "city", "zip", "phone"];
  const missing = required.filter((k) => !shippingInfo?.[k]?.trim());
  if (missing.length) {
    return fail(`Missing shipping fields: ${missing.join(", ")}.`);
  }

  if (!paymentMethod) {
    return fail("Please select a payment method.");
  }

  // Build order items from React cart (id/price already on the item)
  const orderItems = usingReactItems
    ? rawCart.map((item) => {
        // Optionally deduct stock if the product exists in mock DB
        const product = _products.find((p) => p.id === item.id);
        if (product && product.stock > 0) product.stock -= item.qty ?? 1;
        return { productId: item.id, name: item.name, qty: item.qty ?? 1, price: item.price };
      })
    : (() => {
        // Legacy path: look up products from mock DB
        for (const item of rawCart) {
          const product = _products.find((p) => p.id === item.productId);
          if (!product) return null;
          if (product.stock < item.qty) return null;
        }
        return rawCart.map((item) => {
          const product = _products.find((p) => p.id === item.productId);
          product.stock -= item.qty;
          return { productId: item.productId, qty: item.qty, price: product.price };
        });
      })();

  if (!orderItems) {
    return fail("One or more items are no longer available.");
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingFee = 5.99;

  const newOrder = {
    id: "o" + (_orders.length + 1),
    userId,
    items: orderItems,
    shippingFee,
    total: parseFloat((subtotal + shippingFee).toFixed(2)),
    status: "pending",
    payment: paymentMethod,
    address: `${shippingInfo.address}, ${shippingInfo.city}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  _orders.push(newOrder);
  if (!usingReactItems) _carts[userId] = []; // clear mock DB cart (React cart cleared by caller)

  return ok(newOrder, "Order placed successfully! Thank you for your purchase.");
}

/**
 * getOrders(userId)
 */
export async function getOrders(userId) {
  await delay();
  const userOrders = _orders.filter((o) => o.userId === userId);
  return ok(userOrders);
}

/* ─────────────────────────────────────────────────────────────────────────────
   AUCTIONS
───────────────────────────────────────────────────────────────────────────── */

/**
 * getAuctions(filters?)
 * Optional filters: { fandom, isLive, isUrgent }
 */
export async function getAuctions(filters = {}) {
  await delay();

  let results = [..._auctions];

  if (filters.fandom) {
    results = results.filter(
      (a) => a.fandom.toLowerCase() === filters.fandom.toLowerCase(),
    );
  }

  if (filters.isLive !== undefined) {
    results = results.filter((a) => a.isLive === filters.isLive);
  }

  if (filters.isUrgent) {
    results = results.filter((a) => a.isUrgent);
  }

  return ok(results);
}

/**
 * getAuctionById(id)
 */
export async function getAuctionById(id) {
  await delay();
  const auction = _auctions.find((a) => a.id === id);
  if (!auction) return fail("Auction not found.");

  const bids = _bids[id] ?? [];
  return ok({ ...auction, bids });
}

/**
 * placeBid(userId, auctionId, amount)
 *
 * Edge cases: auction not found, bid too low, auction ended.
 */
export async function placeBid(userId, auctionId, amount) {
  await delay(600);

  const auction = _auctions.find((a) => a.id === auctionId);
  if (!auction) return fail("Auction not found.");
  if (!auction.isLive) return fail("This auction has ended.");

  const minBid = auction.currentBid + 5; // minimum increment $5
  if (amount < minBid) {
    return fail(`Bid must be at least $${minBid.toFixed(2)} (current bid + $5.00).`);
  }

  const user = _users.find((u) => u.id === userId);
  if (!user) return fail("User not found. Please log in.");

  if (auction.sellerId === userId) {
    return fail("You cannot bid on your own listing.");
  }

  // Mark previous winning bid as not winning
  if (_bids[auctionId]) {
    _bids[auctionId].forEach((b) => (b.isWinning = false));
  } else {
    _bids[auctionId] = [];
  }

  const newBid = {
    id: "b" + (Object.values(_bids).flat().length + 1),
    auctionId,
    userId,
    user: user.username,
    avatar: user.avatar,
    avatarBg: user.avatarBg,
    amount,
    placedAt: new Date().toISOString(),
    isWinning: true,
  };

  _bids[auctionId].unshift(newBid);
  auction.currentBid = amount;

  return ok(newBid, `Bid of $${amount.toFixed(2)} placed successfully!`);
}

/* ─────────────────────────────────────────────────────────────────────────────
   LISTINGS (Sell Page)
───────────────────────────────────────────────────────────────────────────── */

/**
 * createListing(userId, listingData)
 *
 * Edge cases: missing required fields, invalid price.
 */
export async function createListing(userId, listingData) {
  await delay(700);

  const { name, condition, price, fandom, itemTypes, description } = listingData;

  if (!name?.trim()) return fail("Product name is required.");
  if (!condition) return fail("Please select the item condition.");
  if (!price || isNaN(price) || Number(price) <= 0) {
    return fail("Please enter a valid price greater than $0.");
  }
  if (!fandom?.trim()) return fail("Please specify the fandom / group.");
  if (!itemTypes?.length) return fail("Please select at least one item type.");

  const user = _users.find((u) => u.id === userId);
  if (!user) return fail("You must be logged in to create a listing.");

  const newProduct = {
    id: "p" + (_products.length + 1),
    fandom: fandom.trim(),
    artist: fandom.trim(),
    name: name.trim(),
    type: itemTypes[0],
    condition,
    price: parseFloat(Number(price).toFixed(2)),
    stock: 1,
    sellerId: userId,
    image: "https://placehold.co/300x300/e8e0f7/7c5cbf?text=" + encodeURIComponent(name.trim().slice(0, 12)),
    description: description ?? "",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  _products.push(newProduct);
  return ok(newProduct, "Your listing has been posted successfully!");
}

/**
 * getListingsByUser(userId)
 * Returns all products listed by a specific seller.
 */
export async function getListingsByUser(userId) {
  await delay();
  const listings = _products.filter((p) => p.sellerId === userId);
  return ok(listings);
}

/**
 * deleteListing(userId, productId)
 * Edge cases: not found, not owner.
 */
export async function deleteListing(userId, productId) {
  await delay(400);
  const idx = _products.findIndex((p) => p.id === productId);
  if (idx === -1) return fail("Listing not found.");
  if (_products[idx].sellerId !== userId) return fail("You don't have permission to delete this listing.");
  _products.splice(idx, 1);
  return ok(null, "Listing deleted successfully.");
}

/**
 * updateListing(userId, productId, updates)
 * Allowed fields: name, description, condition, price, stock.
 */
export async function updateListing(userId, productId, updates) {
  await delay(500);
  const product = _products.find((p) => p.id === productId);
  if (!product) return fail("Listing not found.");
  if (product.sellerId !== userId) return fail("You don't have permission to edit this listing.");

  const allowed = ["name", "description", "condition", "price", "stock"];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) product[key] = updates[key];
  });
  return ok(product, "Listing updated successfully.");
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────────────────────────────────────── */

/**
 * sendContactMessage(name, email, message)
 */
export async function sendContactMessage(name, email, message) {
  await delay(500);

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return fail("All fields are required.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return fail("Please enter a valid email address.");
  }

  // Simulate occasional failure
  if (Math.random() < 0.05) {
    return fail("Server error. Please try again in a moment.");
  }

  return ok(null, "Message sent! We'll get back to you within 24 hours.");
}
