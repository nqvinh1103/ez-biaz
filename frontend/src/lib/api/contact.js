import api from "../axiosInstance";

export function sendContactMessage(name, email, message) {
  return api.post("/api/contact", { name, email, message });
}
