const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Product = require('../models/Product');
const { sendOrderConfirmation } = require('../utils/emailService');

// Run every day at midnight
const startBillingJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running billing job for deliveries...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find active subscriptions where nextDeliveryDate is today
      const dueSubscriptions = await Subscription.find({
        status: { $nin: ['cancelled', 'paused'] },
        nextDeliveryDate: {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('userId');

      for (const sub of dueSubscriptions) {
        try {
          // Calculate total from items
          let total = 0;
          for (const item of sub.items) {
            const product = await Product.findById(item.productId);
            if (product) {
              total += product.pricePerUnit * item.qty;
            }
          }

          // Apply wallet deduction if user has balance
          let walletDeduction = 0;
          let wallet = await Wallet.findOne({ userId: sub.userId });
          if (wallet && wallet.balance > 0) {
            walletDeduction = Math.min(total, wallet.balance);
            wallet.balance -= walletDeduction;
            wallet.transactions.push({
              type: 'debit',
              amount: walletDeduction,
              description: 'Wallet applied to subscription delivery',
              referenceId: sub._id.toString()
            });
            await wallet.save();
          }

          const finalAmount = total - walletDeduction;

          // Create Delivery Order
          const order = await Order.create({
            userId: sub.userId._id,
            subscriptionId: sub._id,
            items: sub.items,
            totalAmount: finalAmount,
            walletDeduction,
            status: 'Processing' // Razorpay handles actual payment logic separately
          });

          // Advance nextDeliveryDate
          const currentNext = new Date(sub.nextDeliveryDate);
          const frequency = sub.items[0]?.frequency?.toLowerCase();
          
          if (frequency === 'weekly') {
            currentNext.setDate(currentNext.getDate() + 7);
          } else if (frequency === 'bi-weekly') {
            currentNext.setDate(currentNext.getDate() + 14);
          } else if (frequency === 'monthly') {
            currentNext.setMonth(currentNext.getMonth() + 1);
          } else {
            currentNext.setDate(currentNext.getDate() + 7); // Default
          }

          sub.nextDeliveryDate = currentNext;
          await sub.save();

          // Send confirmation
          if (sub.userId && sub.userId.email) {
            await sendOrderConfirmation(sub.userId.email, order._id, finalAmount);
          }

          console.log(`[CRON] Processed delivery for sub: ${sub._id}`);
        } catch (err) {
          console.error(`[CRON ERROR] Processing sub ${sub._id}:`, err.message);
        }
      }
    } catch (error) {
      console.error('[CRON ERROR] Billing job failed:', error.message);
    }
  });
  console.log('✅ Billing job scheduled (0 0 * * *)');
};

module.exports = startBillingJob;
