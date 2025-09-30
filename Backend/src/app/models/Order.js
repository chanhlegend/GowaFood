const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
    weight: { type: String, enum: ['500G', '1KG'], required: true, default: '1KG' },
  }],
  discount: {
    pointsUsed: { type: Number, default: 0 },
    pointsPercent: { type: Number, default: 0 },
    discountFromPoints: { type: Number, default: 0 },
  },
  amounts: {
    rawSubtotal: { type: Number, required: true },
    subtotalAfterPoints: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  payment: {
    method: { type: String, enum: ['COD', 'BANK'], required: true },
    bankTransferNote: { type: String },
  },
  shipping: {
    method: { type: String, enum: ['STORE', 'HOME'], default: 'STORE' },
    address: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
      ward: { type: String },
      city: { type: String },
      isDefault: { type: Boolean, default: false },
    },
  },
  status: {
    type: String,
    enum: ['PENDING', 'SHIPPING', 'DELIVERED'],
    default: 'PENDING',
    index: true,
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
