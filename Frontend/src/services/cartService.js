// src/services/CartService.js
import axios from "axios";

const API_URL = "/api/cart";

function handleError(error) {
  throw error?.response?.data ?? new Error("Network Error");
}

function getUserId() {
  const user = JSON.parse(localStorage.getItem("user_gowa"));
  return user?._id;
}

export const CartService = {
  async getCart() {
  try {
    const user = JSON.parse(localStorage.getItem("user_gowa"));
    const userId = user?._id;
    const res = await axios.get("/api/cart", { params: { userId } });
    return res.data;
  } catch (error) {
    handleError(error);
  }
},

  async addItem({ productId, quantity = 1, userId } = {}) {
    try {
      const uid = userId || getUserId();
      const body = { productId, quantity };
      if (uid) body.userId = uid;
      const res = await axios.post(`${API_URL}/add`, body);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async updateItem({ productId, quantity, userId } = {}) {
    try {
      const uid = userId || getUserId();
      const body = { productId, quantity };
      if (uid) body.userId = uid;
      const res = await axios.patch(`${API_URL}/update`, body);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  async removeItem({ productId, userId } = {}) {
    try {
      const uid = userId || getUserId();
      const res = await axios.delete(`${API_URL}/item/${productId}`, {
        data: uid ? { userId: uid } : undefined,
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
};
