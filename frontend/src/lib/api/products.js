import api from "../axiosInstance";

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
