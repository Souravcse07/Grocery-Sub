const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    pricePerUnit: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
    images: [{ type: String }],
    inStock: { type: Boolean, default: true },
    season: { type: String, trim: true },
    vendorInfo: { type: mongoose.Schema.Types.Mixed, default: {} },
    sustainabilityScore: { type: Number, min: 0, max: 100, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
