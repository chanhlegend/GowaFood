// tạo controller quản lý mã giảm giá
const GiftCode = require("../models/GiftCode");

const normalizeCode = (code = "") =>
  String(code || "")
    .trim()
    .toUpperCase();

const GiftCodeController = {
  // Tạo mã giảm giá mới
  async createGiftCode(req, res) {
    try {
      const { code, discountPercent, quantity } = req.body;
      const payload = {
        code: normalizeCode(code),
        discountPercent,
        quantity,
      };
      const newGiftCode = new GiftCode(payload);
      await newGiftCode.save();
      res.status(201).json(newGiftCode);
    } catch (error) {
      // lỗi duplicate key (mã trùng)
      if (error && error.code === 11000) {
        return res.status(400).json({ message: "Code đã tồn tại" });
      }
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Lấy tất cả mã giảm giá
  async getAllGiftCodes(_req, res) {
    try {
      const giftCodes = await GiftCode.find().sort({ createdAt: -1 });
      res.status(200).json(giftCodes);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Lấy mã giảm giá theo ID
  async getGiftCodeById(req, res) {
    try {
      const giftCode = await GiftCode.findById(req.params.id);
      if (!giftCode) {
        return res.status(404).json({ message: "Gift code not found" });
      }
      res.status(200).json(giftCode);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Cập nhật mã giảm giá
  async updateGiftCode(req, res) {
    try {
      const { code, discountPercent, quantity } = req.body;
      const update = {};
      if (code !== undefined) update.code = normalizeCode(code);
      if (discountPercent !== undefined)
        update.discountPercent = discountPercent;
      if (quantity !== undefined) update.quantity = quantity;

      const updatedGiftCode = await GiftCode.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true }
      );
      if (!updatedGiftCode) {
        return res.status(404).json({ message: "Gift code not found" });
      }
      res.status(200).json(updatedGiftCode);
    } catch (error) {
      if (error && error.code === 11000) {
        return res.status(400).json({ message: "Code đã tồn tại" });
      }
      res.status(500).json({ message: "Server error", error });
    }
  },

  // Xoá mã giảm giá
  async deleteGiftCode(req, res) {
    try {
      const deletedGiftCode = await GiftCode.findByIdAndDelete(req.params.id);
      if (!deletedGiftCode) {
        return res.status(404).json({ message: "Gift code not found" });
      }
      res.status(200).json({ message: "Gift code deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },

 
  async applyGiftCode(req, res) {
    try {
      const code = normalizeCode(req.body.code);
      if (!code) {
        return res.status(400).json({ message: "Thiếu code" });
      }

      const giftCode = await GiftCode.findOneAndUpdate(
        { code, quantity: { $gt: 0 } },
        { new: true }
      );

      if (!giftCode) {
        return res
          .status(400)
          .json({ message: "Invalid or exhausted gift code" });
      }

      res.status(200).json({ discountPercent: giftCode.discountPercent });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  },
};

module.exports = GiftCodeController;
