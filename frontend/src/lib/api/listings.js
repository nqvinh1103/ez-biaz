import api from "../axiosInstance";

export function getListingsByUser(userId) {
  return api.get(`/api/products/seller/${encodeURIComponent(userId)}`);
}

export function createListing(userId, listingData, images = []) {
  const form = new FormData();
  form.append("name", listingData.name);
  form.append("condition", listingData.condition);
  form.append("price", String(listingData.price));
  form.append("fandom", listingData.fandom);
  (listingData.itemTypes ?? []).forEach((t) => form.append("itemTypes", t));
  if (listingData.description) form.append("description", listingData.description);
  (images ?? []).forEach((file) => form.append("images", file));

  return api.post(`/api/products/seller/${encodeURIComponent(userId)}`, form);
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
