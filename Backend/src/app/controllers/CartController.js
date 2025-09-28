const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ===== Helpers =====
const ALLOWED_WEIGHTS = ["500G", "1KG"];

function normalizeQty(q) {
  const n = parseInt(q, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function normalizeWeight(w) {
  if (!w) return null;
  const s = String(w).trim().toUpperCase();
  if (s === "500" || s === "0.5KG" || s === "0.5") return "500G";
  if (s === "500G") return "500G";
  if (s === "1" || s === "1KG" || s === "1000G") return "1KG";
  return null;
}

// Chuẩn hoá dữ liệu trả về: có weight + lineTotal, totals
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
      weight: it.weight, // 👈 quan trọng
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

// Lấy/khởi tạo giỏ theo user
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

// Lấy userId từ req
function getUserIdFromReq(req) {
  return req.user?._id || req.user?.id || req.params.userId || req.body.userId || req.query.userId;
}

// ===== Controller =====
class CartController {
  // GET /api/cart?userId=
  async getCart(req, res) {
    try {
      const userId = req.query.userId;
      if (!userId) return res.status(400).json({ message: "Thiếu userId" });
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "userId không hợp lệ" });
      }

      const cart = await Cart.findOne({ user: userId }).populate("items.product");
      return res.status(200).json(toResponse(cart));
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Dữ liệu giỏ hàng không hợp lệ", error: err.message });
      }
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  }

  // POST /api/cart/add  { productId, quantity?, weight }
  async addItem(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(400).json({ message: "Thiếu userId" });

      const { productId, quantity, weight } = req.body;
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "productId không hợp lệ" });
      }

      const normWeight = normalizeWeight(weight);
      if (!normWeight || !ALLOWED_WEIGHTS.includes(normWeight)) {
        return res.status(400).json({ message: "weight phải là 500G hoặc 1KG" });
      }

      const qty = normalizeQty(quantity);

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

      const cart = await getOrCreateCart(userId);

      // Tìm theo (product + weight)
      const idx = cart.items.findIndex(
        (it) => String(it.product) === String(productId) && it.weight === normWeight
      );

      const availableStock = typeof product.stock === "number" ? product.stock : undefined;

      if (idx > -1) {
        const newQty = cart.items[idx].quantity + qty;
        const limited = Math.min(newQty, availableStock ?? newQty);
        cart.items[idx].quantity = Math.max(1, limited);
      } else {
        const limited = Math.min(qty, availableStock ?? qty);
        cart.items.push({
          product: product._id,
          quantity: Math.max(1, limited),
          weight: normWeight,
        });
      }

      // 🔧 HOTFIX: backfill item cũ thiếu weight để tránh ValidationError
      for (const it of cart.items) {
        if (!it.weight) it.weight = '1KG';
      }

      await cart.save();
      const populated = await cart.populate("items.product");

      return res.status(200).json({
        message: "Đã thêm vào giỏ hàng",
        ...toResponse(populated),
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Dữ liệu giỏ hàng không hợp lệ", error: err.message });
      }
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  }

  // PATCH /api/cart/update  { productId, quantity, weight }
  async updateItem(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(400).json({ message: "Thiếu userId" });

      const { productId, quantity, weight } = req.body;
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "productId không hợp lệ" });
      }

      const normWeight = normalizeWeight(weight);
      if (!normWeight || !ALLOWED_WEIGHTS.includes(normWeight)) {
        return res.status(400).json({ message: "weight phải là 500G hoặc 1KG" });
      }

      const qty = normalizeQty(quantity);

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

      const cart = await getOrCreateCart(userId);

      const idx = cart.items.findIndex(
        (it) => String(it.product) === String(productId) && it.weight === normWeight
      );
      if (idx === -1) {
        return res.status(404).json({ message: "Sản phẩm/biến thể không có trong giỏ" });
      }

      const limited = Math.min(qty, product.stock ?? qty);
      cart.items[idx].quantity = Math.max(1, limited);

      // 🔧 HOTFIX: backfill legacy
      for (const it of cart.items) {
        if (!it.weight) it.weight = '1KG';
      }

      await cart.save();
      const populated = await cart.populate("items.product");

      return res.status(200).json({
        message: "Đã cập nhật số lượng",
        ...toResponse(populated),
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Dữ liệu giỏ hàng không hợp lệ", error: err.message });
      }
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  }

  // DELETE /api/cart/item/:productId  { weight } (body) hoặc ?weight=
  async removeItem(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(400).json({ message: "Thiếu userId" });

      const { productId } = req.params;
      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "productId không hợp lệ" });
      }

      const normWeight = normalizeWeight(req.body?.weight ?? req.query?.weight);
      if (!normWeight || !ALLOWED_WEIGHTS.includes(normWeight)) {
        return res.status(400).json({ message: "weight phải là 500G hoặc 1KG" });
      }

      const cart = await getOrCreateCart(userId);
      const before = cart.items.length;

      cart.items = cart.items.filter(
        (it) => !(String(it.product) === String(productId) && it.weight === normWeight)
      );

      if (cart.items.length === before) {
        return res.status(404).json({ message: "Sản phẩm/biến thể không có trong giỏ" });
      }

      // 🔧 HOTFIX: backfill legacy
      for (const it of cart.items) {
        if (!it.weight) it.weight = '1KG';
      }

      await cart.save();
      const populated = await cart.populate("items.product");

      return res.status(200).json({
        message: "Đã xóa sản phẩm khỏi giỏ",
        ...toResponse(populated),
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Dữ liệu giỏ hàng không hợp lệ", error: err.message });
      }
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  }

  // DELETE /api/cart/clear
  async clearCart(req, res) {
    try {
      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(400).json({ message: "Thiếu userId" });

      const cart = await getOrCreateCart(userId);
      cart.items = [];

      // 🔧 HOTFIX: không cần ở đây, nhưng giữ schema nhất quán
      await cart.save();

      return res.status(200).json({
        message: "Đã xóa toàn bộ giỏ hàng",
        ...toResponse(cart),
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Dữ liệu giỏ hàng không hợp lệ", error: err.message });
      }
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  }
}

module.exports = new CartController();