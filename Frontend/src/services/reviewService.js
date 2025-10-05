// src/services/ReviewService.js
import axios from "axios";

const API_URL = "https://gowafood.onrender.com/api/reviews";

function handleError(error) {
  // quăng lên message từ server nếu có
  throw error?.response?.data ?? new Error("Network Error");
}

function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("user_gowa"));
    return u?._id || null;
  } catch {
    return null;
  }
}

function normalizeRating(r) {
  const n = Math.round(Number(r));
  if (!Number.isFinite(n)) return 5;
  return Math.max(1, Math.min(5, n));
}

export const ReviewService = {
  async list(productId, { page = 1, limit = 4, sort = "newest" } = {}) {
    try {
      if (!productId) throw new Error("Thiếu productId");
      const res = await axios.get(API_URL, { params: { productId, page, limit, sort } });
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async stats(productId) {
    try {
      if (!productId) throw new Error("Thiếu productId");
      const res = await axios.get(`${API_URL}/stats`, { params: { productId } });
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async getMine(productId) {
    try {
      if (!productId) throw new Error("Thiếu productId");
      const userId = getUserId();
      if (!userId) throw new Error("Bạn cần đăng nhập để xem đánh giá của mình");
      const res = await axios.get(`${API_URL}/mine`, { params: { productId, userId } });
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async create({ productId, rating, comment }) {
    try {
      if (!productId) throw new Error("Thiếu productId");
      const userId = getUserId();
      if (!userId) throw new Error("Bạn cần đăng nhập để đánh giá");

      const payload = {
        productId,
        rating: normalizeRating(rating),
        comment: typeof comment === "string" ? comment.trim() : "",
        userId,
      };

      const res = await axios.post(API_URL, payload);
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async update({ id, rating, comment }) {
    try {
      if (!id) throw new Error("Thiếu id đánh giá");
      const userId = getUserId();
      if (!userId) throw new Error("Bạn cần đăng nhập để cập nhật đánh giá");

      const payload = {
        userId,
        ...(rating !== undefined ? { rating: normalizeRating(rating) } : {}),
        ...(comment !== undefined ? { comment: String(comment).trim() } : {}),
      };

      const res = await axios.patch(`${API_URL}/${id}`, payload);
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async remove(id) {
    try {
      if (!id) throw new Error("Thiếu id đánh giá");
      const userId = getUserId();
      if (!userId) throw new Error("Bạn cần đăng nhập để xoá đánh giá");

      const res = await axios.delete(`${API_URL}/${id}`, { data: { userId } });
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

   async vote(id, value) {
    const userId = getUserId();
   const res = await axios.patch(`/api/reviews/${id}/vote`, { value, userId });
   return res.data;
  },
};
