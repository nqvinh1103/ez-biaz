import api from "../axiosInstance";

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
