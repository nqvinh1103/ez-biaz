import api from "../axiosInstance";

export function getAuctions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.fandom) params.set("fandom", filters.fandom);
  if (filters.isLive !== undefined)
    params.set("isLive", String(filters.isLive));
  if (filters.isUrgent) params.set("isUrgent", "true");

  const qs = params.toString();
  return api.get(`/api/auctions${qs ? `?${qs}` : ""}`);
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

export function createAuction({
  productId,
  sellerId,
  durationHours,
  durationSeconds,
  isUrgent = false,
}) {
  return api.post("/api/auctions", {
    productId,
    sellerId,
    durationHours,
    durationSeconds,
    isUrgent,
  });
}

export function getSellerAuctions(sellerId, { status } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const qs = params.toString();
  return api.get(
    `/api/auctions/seller/${encodeURIComponent(sellerId)}${qs ? `?${qs}` : ""}`,
  );
}

export function getWonAuctions(userId, { pendingPaymentOnly } = {}) {
  const params = new URLSearchParams();
  if (pendingPaymentOnly) params.set("pendingPaymentOnly", "true");
  const qs = params.toString();
  return api.get(
    `/api/auctions/won/${encodeURIComponent(userId)}${qs ? `?${qs}` : ""}`,
  );
}

export function relistAuction(auctionId, { sellerId, durationHours, durationSeconds, isUrgent = false }) {
  return api.post(`/api/auctions/${encodeURIComponent(auctionId)}/relist`, {
    sellerId,
    durationHours,
    durationSeconds,
    isUrgent,
  });
}
