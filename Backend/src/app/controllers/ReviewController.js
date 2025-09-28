// src/app/controllers/ReviewController.js
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");

function getUserIdFromReq(req) {
  return req.user?._id || req.user?.id || req.body.userId || req.query.userId || req.params.userId;
}
function isValidObjectId(id) {
  return id && mongoose.Types.ObjectId.isValid(id);
}
function normalizeRating(r) {
  const n = Number(r);
  if (!Number.isFinite(n)) return 5;
  return Math.max(1, Math.min(5, Math.round(n)));
}
function toItemResponse(doc) {
  if (!doc) return null;
  return {
    _id: doc._id,
    rating: doc.rating,
    comment: doc.comment,
    product: doc.product?._id || doc.product,
    user: doc.user ? { _id: doc.user._id, name: doc.user.name, avatar: doc.user.avatar } : doc.user,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    upVotes: doc.votes?.filter(v => v.value === "up").length || 0,
    downVotes: doc.votes?.filter(v => v.value === "down").length || 0,
  };
}

class ReviewController {
  async listByProduct(req, res) {
    try {
      const { productId } = req.query;
      if (!isValidObjectId(productId)) return res.status(400).json({ message: "productId không hợp lệ" });

      const page = Math.max(1, parseInt(req.query.page || "1", 10));
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || "10", 10)));
      const skip = (page - 1) * limit;

      const sortKey = String(req.query.sort || "newest");
      let sort = { createdAt: -1 };
      if (sortKey === "highest") sort = { rating: -1, createdAt: -1 };
      if (sortKey === "lowest")  sort = { rating: 1,  createdAt: -1 };

      const [total, list] = await Promise.all([
        Review.countDocuments({ product: productId }),
        Review.find({ product: productId })
          .sort(sort).skip(skip).limit(limit)
          .populate("user", "name avatar _id"),
      ]);

      return res.status(200).json({
        items: list.map(toItemResponse),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (err) { return res.status(500).json({ message: "Lỗi server", error: err.message }); }
  }

  async stats(req, res) {
    try {
      const { productId } = req.query;
      if (!isValidObjectId(productId)) return res.status(400).json({ message: "productId không hợp lệ" });

      const agg = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]);

      const total = agg.reduce((s, a) => s + a.count, 0);
      const byStar = {1:0,2:0,3:0,4:0,5:0};
      let sum = 0;
      for (const row of agg) {
        const star = String(row._id);
        if (byStar[star] !== undefined) byStar[star] = row.count;
        sum += (row._id || 0) * row.count;
      }
      const average = total > 0 ? +(sum / total).toFixed(2) : 0;

      return res.status(200).json({ productId, total, average, distribution: byStar });
    } catch (err) { return res.status(500).json({ message: "Lỗi server", error: err.message }); }
  }

  async getMine(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!isValidObjectId(userId)) return res.status(400).json({ message: "Thiếu hoặc userId không hợp lệ" });
      const { productId } = req.query;
      if (!isValidObjectId(productId)) return res.status(400).json({ message: "productId không hợp lệ" });

      const doc = await Review.findOne({ user: userId, product: productId }).populate("user", "name avatar _id");
      return res.status(200).json({ item: toItemResponse(doc) });
    } catch (err) { return res.status(500).json({ message: "Lỗi server", error: err.message }); }
  }

  async create(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!isValidObjectId(userId)) return res.status(400).json({ message: "Thiếu hoặc userId không hợp lệ" });

      const { productId, rating, comment } = req.body;
      if (!isValidObjectId(productId)) return res.status(400).json({ message: "productId không hợp lệ" });

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

      const score = normalizeRating(rating);
      let doc = await Review.findOne({ user: userId, product: productId });
      if (doc) {
        doc.rating = score;
        if (typeof comment === "string") doc.comment = comment;
        await doc.save();
      } else {
        doc = await Review.create({ user: userId, product: productId, rating: score, comment });
      }

      const populated = await Review.findById(doc._id).populate("user", "name avatar _id");
      return res.status(201).json({ message: "Đã lưu đánh giá", item: toItemResponse(populated) });
    } catch (err) { return res.status(500).json({ message: "Lỗi server", error: err.message }); }
  }

  async update(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!isValidObjectId(userId)) return res.status(400).json({ message: "Thiếu hoặc userId không hợp lệ" });

      const { id } = req.params;
      if (!isValidObjectId(id)) return res.status(400).json({ message: "id không hợp lệ" });

      const { rating, comment } = req.body;
      const doc = await Review.findById(id);
      if (!doc) return res.status(404).json({ message: "Không tìm thấy đánh giá" });
      if (String(doc.user) !== String(userId)) return res.status(403).json({ message: "Không có quyền sửa" });

      if (rating !== undefined)  doc.rating = normalizeRating(rating);
      if (comment !== undefined) doc.comment = String(comment);

      await doc.save();
      const populated = await Review.findById(id).populate("user", "name avatar _id");
      return res.status(200).json({ message: "Đã cập nhật", item: toItemResponse(populated) });
    } catch (err) { return res.status(500).json({ message: "Lỗi server", error: err.message }); }
  }

  async remove(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!isValidObjectId(userId)) return res.status(400).json({ message: "Thiếu hoặc userId không hợp lệ" });
      const { id } = req.params;
      if (!isValidObjectId(id)) return res.status(400).json({ message: "id không hợp lệ" });

      const doc = await Review.findById(id);
      if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
      if (String(doc.user) !== String(userId)) return res.status(403).json({ message: "Không có quyền xoá" });

      await Review.deleteOne({ _id: id });
      return res.status(200).json({ message: "Đã xoá" });
    } catch (err) { return res.status(500).json({ message: "Lỗi server", error: err.message }); }
  }

  async vote(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!isValidObjectId(userId)) return res.status(400).json({ message: "Thiếu hoặc userId không hợp lệ" });

      const { value } = req.body;
      if (!["up", "down"].includes(value)) return res.status(400).json({ message: "value phải là up hoặc down" });

      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

      review.votes = review.votes?.filter(v => String(v.user) !== String(userId)) || [];
      review.votes.push({ user: userId, value });
      await review.save();

      res.json({
        message: "Đã ghi nhận bình chọn",
        upVotes: review.votes.filter(v => v.value === "up").length,
        downVotes: review.votes.filter(v => v.value === "down").length
      });
    } catch (e) { res.status(500).json({ message: e.message }); }
  }
}

module.exports = new ReviewController();
