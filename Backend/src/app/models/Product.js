const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: {
      lotNumber: String,
      variety: String,
      plantingDate: Date,
      fertilizer: [{ type: String }],
      pesticide: [{ type: String }],
      harvestDate: Date,
      packaging: String,
    },
    price: { type: Number, required: true },
    
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    images: [{ url: { type: String } }],
    stock: { type: Number, default: 0 },
    qrSource: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
