const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  image: String,
  stock: { type: Number, default: 0 },
  qrSource: { type: mongoose.Schema.Types.ObjectId, ref: 'QRSource' },
  promotion: { type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
