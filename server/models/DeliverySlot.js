const mongoose = require('mongoose');

const deliverySlotSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format YYYY-MM-DD
  timeRange: { type: String, required: true }, // e.g. "Morning (8 AM - 12 PM)"
  capacity: { type: Number, required: true, default: 10 },
  booked: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true } // For TTL index
}, { timestamps: true });

// TTL index to automatically delete slots 7 days after they expire
deliverySlotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('DeliverySlot', deliverySlotSchema);
