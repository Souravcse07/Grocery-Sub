const mongoose = require('mongoose');

const subscriptionItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    frequency: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [subscriptionItemSchema], required: true },
    status: {
      type: String,
      enum: [
        'created',
        'authenticated',
        'active',
        'pending',
        'halted',
        'cancelled',
        'canceled',
        'completed',
        'expired',
        'paused'
      ],
      default: 'created'
    },
    nextDeliveryDate: { type: Date, required: true },
    deliverySlotId: { type: String, required: true, trim: true },
    deliveryAddress: { type: String, required: true, default: 'Address not provided' },
    phoneNumber: { type: String, required: true, default: '+919999999999' },
    paymentMethod: { type: String, enum: ['Razorpay', 'COD'], default: 'Razorpay' },
    razorpaySubscriptionId: { type: String, trim: true },
    razorpayPlanId: { type: String, trim: true },
    walletCreditPerCycle: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);

