import api from "../axiosInstance";

export function login(email, password) {
  return api.post("/api/auth/login", { email, password });
}

export function register(userData) {
  return api.post("/api/auth/register", userData);
}

export function logout() {
  return api.post("/api/auth/logout").catch(() => ({ success: true }));
}
