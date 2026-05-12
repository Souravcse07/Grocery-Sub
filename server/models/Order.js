const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  qty: Number,
  price: Number
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  walletDeduction: { type: Number, default: 0 },
  status: { type: String, enum: ['Processing', 'Confirmed', 'Out_for_delivery', 'In Transit', 'Delivered', 'Failed', 'Cancelled'], default: 'Processing' },
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },
  deliveryAddress: { type: String, default: 'Address not provided' },
  phoneNumber: { type: String, default: '+919999999999' },
  deliveredDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
