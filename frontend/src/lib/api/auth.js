import api from "../axiosInstance";
import { fail } from "../axiosInstance";

export async function login(email, password) {
  if (!email || !password) return fail("Email and password are required.");
  return api.post("/api/auth/login", { email, password });
}

export function register(userData) {
  return api.post("/api/auth/register", userData);
}

export function logout() {
  return api.post("/api/auth/logout").catch(() => ({ success: true }));
}
