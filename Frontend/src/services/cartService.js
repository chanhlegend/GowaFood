import axios from "axios";

const API_URL = "https://gowafood.onrender.com/api/cart";

function handleError(error) {
  throw (error?.response?.data) ?? new Error("Network Error");
}

function getUserId() {
  const user = JSON.parse(localStorage.getItem("user_gowa"));
  return user?._id;
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
      const userId = getUserId();
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

      const uid = userId || getUserId();

      const body = { productId, quantity, weight: normWeight };
      if (uid) body.userId = uid;

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

      const uid = userId || getUserId();
      const body = { productId, quantity, weight: normWeight };
      if (uid) body.userId = uid;

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

      const uid = userId || getUserId();

      const res = await axios.delete(`${API_URL}/item/${productId}`, {
        data: uid ? { userId: uid, weight: normWeight } : { weight: normWeight },
      });

      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async clearCart(userId) {
    try {
      const uid = userId || getUserId();
      const res = await axios.delete(`${API_URL}/clear`, {
        data: uid ? { userId: uid } : undefined,
      });
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async getItemCount(userId) {
    try {
      const res = await axios.get(`${API_URL}/count/${userId}`);
      return res.data?.itemCount || 0;
    } catch (error) {
      handleError(error);
    }
  },
};
