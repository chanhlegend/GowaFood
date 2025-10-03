const Order = require("../models/Order");

const OrderController = {
  async createOrder(req, res) {
    try {
      const OrderData = req.body;
      const newOrder = new Order(OrderData);
      const savedOrder = await newOrder.save();
      res
        .status(201)
        .json({ message: "Tạo đơn hàng thành công", data: savedOrder });
    } catch (err) {
      res
        .status(400)
        .json({ message: "Tạo đơn hàng thất bại", error: err.message });
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
      res
        .status(500)
        .json({
          message: "Lỗi khi lấy danh sách đơn hàng",
          error: err.message,
        });
    }
  },

  async getOrderDetail(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id).populate("products.product").populate("user");

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
        return res
          .status(404)
          .json({
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
      res
        .status(500)
        .json({
          message: "Lỗi khi lấy danh sách đơn hàng",
          error: err.message,
        });
    }
  },
};

module.exports = OrderController;
