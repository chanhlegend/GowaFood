const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  endowment: Number,
  total: Number,
  status: { type: String, enum: ['pending', 'paid', 'cancelled', 'completed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['bank', 'cod'] },
  address: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
