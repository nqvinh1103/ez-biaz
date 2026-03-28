import api from "../axiosInstance";

export function getAuctions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.fandom) params.set("fandom", filters.fandom);
  if (filters.isLive !== undefined) params.set("isLive", String(filters.isLive));
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

export function createAuction(userId, payload, files) {
  const form = new FormData();
  form.append("userId", userId);
  Object.entries(payload).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((item) => form.append(k, item));
    else form.append(k, v);
  });
  if (files?.length) files.forEach((f) => form.append("images", f));
  return api.post("/api/auctions", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
