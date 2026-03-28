import api from "../axiosInstance";

export function getProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.fandom) params.set("fandom", filters.fandom);
  if (filters.type) params.set("type", filters.type);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.inStockOnly) params.set("inStockOnly", "true");

  const qs = params.toString();
  return api.get(`/api/products${qs ? `?${qs}` : ""}`);
}

export function getProductById(id) {
  return api.get(`/api/products/${encodeURIComponent(id)}`);
}
