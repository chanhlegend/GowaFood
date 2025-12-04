const Order = require("../models/Order");
const Gifcode = require("../models/GiftCode");
const mongoose = require("mongoose");
const Product = require("../models/Product");

const normalizeCode = (code = "") =>
  String(code || "")
    .trim()
    .toUpperCase();

const OrderController = {
  async createOrder(req, res) {
    const session = await mongoose.startSession();
    try {
      const orderData = req.body;
      console.log(orderData);
      

      let savedOrder = null;

      await session.withTransaction(async () => {
        // 1) Nếu có gift code: trừ quantity trong transaction
        if (
          orderData?.discount?.type === "GIFT_CODE" &&
          orderData.discount.code
        ) {
          const code = normalizeCode(orderData.discount.code);

          const giftCode = await Gifcode.findOneAndUpdate(
            { code, quantity: { $gt: 0 } },
            { $inc: { quantity: -1 } },
            { new: true, session }
          );

          if (!giftCode) {
            throw new Error("GIFT_CODE_INVALID_OR_EXHAUSTED");
          }

          const percent = Number(
            giftCode.discountPercent ?? giftCode.percent ?? 0
          );
          if (!Number.isFinite(percent) || percent <= 0) {
            throw new Error("GIFT_CODE_PERCENT_INVALID");
          }

          // đồng bộ percent để chống sửa từ client
          orderData.discount.percent = percent;
        }

        // 2) Lưu đơn trong transaction
        const newOrder = new Order(orderData);

        savedOrder = await newOrder.save({ session });

        
      // trừ số lượng của hàng hóan trong kho

      const products = orderData.products.map((item) => {
        return {
          _id: item.product,
          quantity: item.quantity || 1,
        }
      });

      // Lọc và lấy product theo ID
      products.forEach(async (item) => {
        const product = await Product.findById(item._id);
        if (product) {
          if (product.stock < item.quantity) {
            return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng trong kho.` });
          }
          product.stock -= item.quantity;
          await product.save();
        } else {
          return res.status(404).json({ message: `Sản phẩm với ID ${item._id} không tồn tại.` });
        }
      });
      });

      return res
        .status(201)
        .json({ message: "Tạo đơn hàng thành công", data: savedOrder });
    } catch (err) {
      const mapMsg = (e) => {
        if (e?.message === "GIFT_CODE_INVALID_OR_EXHAUSTED")
          return "Mã giảm giá không hợp lệ hoặc đã hết lượt.";
        if (e?.message === "GIFT_CODE_PERCENT_INVALID")
          return "Gift code không hợp lệ (percent).";
        return e?.message || "Tạo đơn hàng thất bại";
      };
      return res.status(400).json({ message: mapMsg(err) });
    } finally {
      session.endSession();
    }
  },
  async getOrders(req, res) {
    try {
      const userId = req.query.userId;
      if (!userId) {
        return res.status(400).json({ message: "Thiếu userId" });
      }

      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate("products.product")
        .populate("user");
      res.status(200).json({ message: "Danh sách đơn hàng", data: orders });
    } catch (err) {
      res.status(500).json({
        message: "Lỗi khi lấy danh sách đơn hàng",
        error: err.message,
      });
    }
  },

  async getOrderDetail(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id)
        .populate("products.product")
        .populate("user");

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      res.status(200).json({ message: "Chi tiết đơn hàng", data: order });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi khi lấy chi tiết đơn hàng", error: err.message });
    }
  },
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      console.log("Cancel order ID:", id);

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          message: "Đơn hàng không tồn tại hoặc không thuộc người dùng này.",
        });
      }

      if (order.status !== "PENDING") {
        return res
          .status(400)
          .json({ message: "Chỉ có thể hủy đơn hàng có trạng thái PENDING." });
      }

      order.status = "CANCELLED";
      await order.save();

      res.status(200).json({ message: "Hủy đơn hàng thành công", data: order });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi khi hủy đơn hàng", error: err.message });
    }
  },

  // lấy order theo productId và userId
  async getOrderByProductAndUser(req, res) {
    try {
      const { productId, userId } = req.params;
      if (!productId || !userId) {
        return res.status(400).json({ message: "Thiếu productId hoặc userId" });
      }
      const orders = await Order.find({
        user: userId,
        products: { $elemMatch: { product: productId } },
      });
      res.status(200).json({ message: "Danh sách đơn hàng", data: orders });
    } catch (err) {
      res.status(500).json({
        message: "Lỗi khi lấy danh sách đơn hàng",
        error: err.message,
      });
    }
  },

  // Bestsellers aggregation by month/year
  async getBestsellersByMonthYear(req, res) {
    try {
      const { month, year, limit } = req.query;
      const m = Number(month);
      const y = Number(year);
      const top = Math.max(1, Math.min(Number(limit) || 8, 50));

      if (!m || !y || m < 1 || m > 12) {
        return res.status(400).json({ message: "Thiếu hoặc sai month/year" });
      }

      const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
      const end = new Date(y, m, 1, 0, 0, 0, 0);

      const pipeline = [
        {
          $match: {
            createdAt: { $gte: start, $lt: end },
            status: { $ne: "CANCELLED" },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.product",
            totalQuantity: { $sum: { $ifNull: ["$products.quantity", 1] } },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: top },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 0,
            productId: "$product._id",
            name: "$product.name",
            totalQuantity: 1,
          },
        },
      ];

      const rows = await Order.aggregate(pipeline);
      return res.status(200).json({
        message: "Top sản phẩm bán chạy",
        data: rows,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Lỗi khi tổng hợp sản phẩm bán chạy",
        error: err?.message || String(err),
      });
    }
  },

  async getAllOrders(req, res) {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate("products.product")
        .populate("user");
      res.status(200).json({ message: "Danh sách tất cả đơn hàng", data: orders });
    } catch (err) {
      res.status(500).json({
        message: "Lỗi khi lấy danh sách tất cả đơn hàng",
        error: err.message,
      });
    }
  },
};

module.exports = OrderController;
