import api from "../axiosInstance";

/** Lấy thông tin user đang đăng nhập */
export function getMe() {
  return api.get("/api/users/me");
}

/** Cập nhật thông tin ngân hàng */
export function updateBankInfo({ bankName, bankAccountNumber, bankAccountName }) {
  return api.put("/api/users/me/bank", { bankName, bankAccountNumber, bankAccountName });
}
