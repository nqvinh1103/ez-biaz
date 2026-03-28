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
  isUrgent = false,
}) {
  return api.post("/api/auctions", {
    productId,
    sellerId,
    durationHours,
    isUrgent,
  });
}
