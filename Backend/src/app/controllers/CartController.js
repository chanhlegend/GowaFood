// controllers/cartController.js
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Helper: ép kiểu & chặn biên số lượng
function normalizeQty(q) {
  const n = parseInt(q, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

// Helper: tính totals + lineTotal
function toResponse(cartDoc) {
  if (!cartDoc) {
    return {
      items: [],
      totals: { itemCount: 0, subtotal: 0 },
    };
  }

  const items = cartDoc.items.map((it) => {
    const p = it.product;
    const price = p?.price ?? 0;
    const quantity = it.quantity ?? 1;
    const lineTotal = price * quantity;

    return {
      product: p
        ? {
            _id: p._id,
            name: p.name,
            price: p.price,
            images: p.images,
            stock: p.stock,
            category: p.category,
          }
        : null,
      quantity,
      lineTotal,
    };
  });

  const subtotal = items.reduce((s, it) => s + (it.lineTotal || 0), 0);
  const itemCount = items.reduce((s, it) => s + (it.quantity || 0), 0);

  return {
    _id: cartDoc._id,
    user: cartDoc.user,
    items,
    totals: { itemCount, subtotal },
  };
}

// Helper: lấy hoặc tạo giỏ
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

// Lấy userId từ req (ưu tiên req.user, fallback params/body cho test)
function getUserIdFromReq(req) {
  return req.user?._id || req.user?.id || req.params.userId || req.body.userId;
}

class CartController {
  // GET /api/cart
  async getCart(req, res) {
    try {
      const userId = req.query.userId;
      if (!userId) return res.status(400).json({ message: "Thiếu userId" });

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "userId không hợp lệ" });
      }

      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product"
      );

      return res.status(200).json(toResponse(cart));
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: err.message });
    }
  }

  // POST /api/cart/add  { productId, quantity? }
  async addItem(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(400).json({ message: "Thiếu userId" });

      const { productId, quantity } = req.body;
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "productId không hợp lệ" });
      }
      const qty = normalizeQty(quantity);

      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

      const cart = await getOrCreateCart(userId);

      const idx = cart.items.findIndex(
        (it) => String(it.product) === String(productId)
      );
      if (idx > -1) {
        // gộp dòng
        const newQty = cart.items[idx].quantity + qty;
        const limited = Math.min(newQty, product.stock ?? newQty); // nếu stock undefined -> không giới hạn
        cart.items[idx].quantity = Math.max(1, limited);
      } else {
        // thêm mới
        const limited = Math.min(qty, product.stock ?? qty);
        cart.items.push({
          product: product._id,
          quantity: Math.max(1, limited),
        });
      }

      await cart.save();
      const populated = await cart.populate("items.product");

      return res.status(200).json({
        message: "Đã thêm vào giỏ hàng",
        ...toResponse(populated),
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: err.message });
    }
  }

  async updateItem(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(400).json({ message: "Thiếu userId" });

      const { productId, quantity } = req.body;
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "productId không hợp lệ" });
      }
      const qty = normalizeQty(quantity);

      const product = await Product.findById(productId);
      if (!product)
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

      const cart = await getOrCreateCart(userId);
      const idx = cart.items.findIndex(
        (it) => String(it.product) === String(productId)
      );
      if (idx === -1)
        return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });

      const limited = Math.min(qty, product.stock ?? qty);
      cart.items[idx].quantity = Math.max(1, limited);

      await cart.save();
      const populated = await cart.populate("items.product");

      return res.status(200).json({
        message: "Đã cập nhật số lượng",
        ...toResponse(populated),
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: err.message });
    }
  }

  async removeItem(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(400).json({ message: "Thiếu userId" });

      const { productId } = req.params;
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "productId không hợp lệ" });
      }

      const cart = await getOrCreateCart(userId);
      const before = cart.items.length;
      cart.items = cart.items.filter(
        (it) => String(it.product) !== String(productId)
      );

      if (cart.items.length === before) {
        return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });
      }

      await cart.save();
      const populated = await cart.populate("items.product");

      return res.status(200).json({
        message: "Đã xóa sản phẩm khỏi giỏ",
        ...toResponse(populated),
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: err.message });
    }
  }

  // DELETE /api/cart/clear
  async clearCart(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(400).json({ message: "Thiếu userId" });

      const cart = await getOrCreateCart(userId);
      cart.items = [];
      await cart.save();

      return res.status(200).json({
        message: "Đã xóa toàn bộ giỏ hàng",
        ...toResponse(cart),
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: err.message });
    }
  }
}

module.exports = new CartController();
