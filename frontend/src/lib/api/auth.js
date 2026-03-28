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
  // POST with no body — transformRequest prevents axios from serialising
  // null to "null" and attaching Content-Type: application/json (→ 415).
  return api
    .post("/api/auth/logout", null, {
      transformRequest: [() => undefined],
      headers: { "Content-Type": false },
    })
    .catch(() => ({ success: true }));
}
