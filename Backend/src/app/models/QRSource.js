const mongoose = require('mongoose');

const QRSourceSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  origin: String,
  qrCode: String,
}, { timestamps: true });

module.exports = mongoose.model('QRSource', QRSourceSchema);
