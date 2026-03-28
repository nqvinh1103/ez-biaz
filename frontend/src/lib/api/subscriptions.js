import api from "../axiosInstance";

/** GET current subscription for the logged-in user */
export function getMySubscription() {
  return api.get("/api/subscriptions/me");
}

/** POST subscribe to a plan: planId = "boost" | "premium" */
export function subscribe(planId) {
  // VNPay flow: backend returns payUrl, frontend redirects.
  return api.post("/api/payments/vnpay/subscriptions/create", { planId });
}

/** DELETE cancel current subscription */
export function cancelSubscription() {
  return api.delete("/api/subscriptions/me");
}
