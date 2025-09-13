const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String },
    googleId: { type: String },
    name: { type: String },
    profile: {
      avatar: {
        type: String,
        default:
          "https://cdn.sforum.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg",
      },
    },
    addresses: [
      {
        name: { type: String, required: true }, // Tên người nhận
        phone: { type: String, required: true }, // Số điện thoại người nhận
        address: { type: String, required: true }, // Địa chỉ chi tiết
        ward: { type: String, required: true }, // Xã/Phường
        city: { type: String, required: true }, // Thành phố/Tỉnh
        isDefault: { type: Boolean, default: false }, // Địa chỉ mặc định
      }
    ],
    otp: { type: String },
    otpExpires: { type: Date },
    points: { type: Number, default: 0 }, // dùng để đổi điểm thưởng
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
