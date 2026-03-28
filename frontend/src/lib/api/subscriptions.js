import api from "../axiosInstance";

/** GET current subscription for the logged-in user */
export function getMySubscription() {
  return api.get("/api/subscriptions/me");
}

/** POST subscribe to a plan: planId = "boost" | "premium" */
export function subscribe(planId) {
  return api.post("/api/subscriptions", { planId });
}

/** DELETE cancel current subscription */
export function cancelSubscription() {
  return api.delete("/api/subscriptions/me");
}
