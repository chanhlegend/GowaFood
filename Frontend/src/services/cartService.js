import axios from "axios";
import API_BASE_URL from "@/config/api";
const API_URL = `${API_BASE_URL}/api/cart`;

function handleError(error) {
  // Nếu BE trả 401 -> chuyển login luôn cho chắc
  const status = error?.response?.status;
  const msg = error?.response?.data?.message || "Network Error";
  if (status === 401) {
    // tuỳ UI, bạn có thể thay toast ở đây
    if (typeof window !== "undefined") {
      alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục."); // hoặc dùng toast
      window.location.href = "/login"; // ROUTE_PATH.LOGIN nếu có
    }
  }
  throw error?.response?.data ?? new Error(msg);
}

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user_gowa"));
    return user?._id || null;
  } catch {
    return null;
  }
}

function requireAuth(explicitUserId) {
  const uid = explicitUserId || getUserId();
  if (!uid) {
    if (typeof window !== "undefined") {
      alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      window.location.href = "/login";
    }
    // ném lỗi để caller dừng lại
    const err = new Error("UNAUTHENTICATED");
    err.code = "UNAUTHENTICATED";
    throw err;
  }
  return uid;
}

function normalizeWeight(w) {
  if (!w) return null;
  const s = String(w).trim().toUpperCase();
  if (s === "500" || s === "0.5KG" || s === "0.5") return "500G";
  if (s === "500G") return "500G";
  if (s === "1" || s === "1KG" || s === "1000G") return "1KG";
  return null;
}

const ALLOWED_WEIGHTS = ["500G", "1KG"];

export const CartService = {
  async getCart() {
    try {
      const userId = requireAuth(); // 🔒 yêu cầu đăng nhập
      const res = await axios.get(API_URL, { params: { userId } });
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  addItem: async function ({ productId, quantity = 1, weight, userId } = {}) {
    try {
      if (!productId) throw new Error("Thiếu productId");

      const normWeight = normalizeWeight(weight);
      if (!normWeight || !ALLOWED_WEIGHTS.includes(normWeight)) {
        throw new Error("weight phải là 500G hoặc 1KG");
      }

      const uid = requireAuth(userId); // 🔒

      const body = { productId, quantity, weight: normWeight, userId: uid };
      const res = await axios.post(`${API_URL}/add`, body);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  updateItem: async function ({ productId, quantity, weight, userId } = {}) {
    try {
      if (!productId) throw new Error("Thiếu productId");

      const normWeight = normalizeWeight(weight);
      if (!normWeight || !ALLOWED_WEIGHTS.includes(normWeight)) {
        throw new Error("weight phải là 500G hoặc 1KG");
      }

      const uid = requireAuth(userId); // 🔒
      const body = { productId, quantity, weight: normWeight, userId: uid };

      const res = await axios.patch(`${API_URL}/update`, body);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  removeItem: async function ({ productId, weight, userId } = {}) {
    try {
      if (!productId) throw new Error("Thiếu productId");

      const normWeight = normalizeWeight(weight);
      if (!normWeight || !ALLOWED_WEIGHTS.includes(normWeight)) {
        throw new Error("weight phải là 500G hoặc 1KG");
      }

      const uid = requireAuth(userId); // 🔒

      const res = await axios.delete(`${API_URL}/item/${productId}`, {
        data: { userId: uid, weight: normWeight },
      });

      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async clearCart(userId) {
    try {
      const uid = requireAuth(userId); // 🔒
      const res = await axios.delete(`${API_URL}/clear`, { data: { userId: uid } });
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async getItemCount(userId) {
    try {
      const uid = requireAuth(userId); // 🔒 để đồng nhất hành vi
      const res = await axios.get(`${API_URL}/count/${uid}`);
      return res.data?.itemCount || 0;
    } catch (error) {
      handleError(error);
    }
  },
};
