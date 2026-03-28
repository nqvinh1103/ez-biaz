import api from "../axiosInstance";

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
