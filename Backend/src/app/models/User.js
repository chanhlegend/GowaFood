const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String, unique: true },
  password: { type: String },
  googleId: { type: String },
  name: { type: String },
  profile: {
    avatar: String,
    phone: String,
    address: String,
  },
  points: { type: Number, default: 0 }, // dùng để đổi điểm thưởng
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
