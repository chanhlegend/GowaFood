const mongoose = require('mongoose');

const GiftCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountPercent: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('GiftCode', GiftCodeSchema);