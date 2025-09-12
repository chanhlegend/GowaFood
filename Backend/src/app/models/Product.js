const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [{ url: { type: String } }],
  stock: { type: Number, default: 0 },
  qrSource: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
