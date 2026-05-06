const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const sendSMS = require('../utils/sendSMS');

exports.handleWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'my_webhook_secret';
    const signature = req.headers['x-razorpay-signature'];
    
    // Validate Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn("Invalid webhook signature detected!");
      return res.status(400).send('Invalid signature');
    }

    // Parse payload (req.body is Buffer because of express.raw)
    const payload = JSON.parse(req.body.toString());
    const event = payload.event;
    
    console.log(`[Webhook Received] Event: ${event}`);

    switch (event) {
      case 'subscription.charged': {
        const subData = payload.payload.subscription.entity;
        const paymentData = payload.payload.payment.entity;
        
        // Find DB subscription
        const dbSub = await Subscription.findOne({ razorpaySubscriptionId: subData.id });
        if (!dbSub) {
          console.error(`Subscription ${subData.id} not found in DB`);
          break;
        }

        // Create an Order
        const newOrder = await Order.create({
          userId: dbSub.userId,
          subscriptionId: dbSub._id,
          items: dbSub.items, // Copy items from subscription
          totalAmount: paymentData.amount / 100, // convert paisa to rupees
          status: 'Processing',
          razorpayPaymentId: paymentData.id,
          razorpayOrderId: paymentData.order_id,
          deliveryAddress: dbSub.deliveryAddress,
          phoneNumber: dbSub.phoneNumber
        });

        // Send SMS Notification
        if (dbSub.phoneNumber) {
          const message = `Success! Your FreshCart order #${newOrder._id.toString().slice(-6).toUpperCase()} is confirmed and will be delivered to: ${dbSub.deliveryAddress.substring(0, 30)}...`;
          await sendSMS(dbSub.phoneNumber, message);
        }

        // Credit Wallet if subscription dictates it
        if (dbSub.walletCreditPerCycle > 0) {
          let wallet = await Wallet.findOne({ userId: dbSub.userId });
          if (!wallet) {
            wallet = new Wallet({ userId: dbSub.userId, balance: 0, transactions: [] });
          }
          wallet.balance += dbSub.walletCreditPerCycle;
          wallet.transactions.push({
            type: 'credit',
            amount: dbSub.walletCreditPerCycle,
            description: `Cashback for Subscription Delivery`,
            referenceId: subData.id
          });
          await wallet.save();
        }

        console.log(`Order ${newOrder._id} created for Subscription ${dbSub._id}`);
        break;
      }

      case 'subscription.cancelled': {
        const subData = payload.payload.subscription.entity;
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subData.id },
          { status: 'canceled' }
        );
        console.log(`Subscription ${subData.id} cancelled.`);
        break;
      }

      case 'subscription.halted': {
        const subData = payload.payload.subscription.entity;
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subData.id },
          { status: 'halted' }
        );
        console.log(`[EMAIL] To User: Your subscription payment failed. Please update your payment method for subscription ${subData.id}.`);
        break;
      }

      case 'payment.captured': {
        const paymentData = payload.payload.payment.entity;
        // Optionally update the standalone order status
        const order = await Order.findOneAndUpdate(
          { razorpayOrderId: paymentData.order_id },
          { status: 'Processing', razorpayPaymentId: paymentData.id },
          { new: true }
        );
        if (order && order.phoneNumber) {
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
          const message = `Order Confirmed! Your FreshCart order #${order._id.toString().slice(-6).toUpperCase()} is confirmed. Track it at: ${frontendUrl}/dashboard`;
          await sendSMS(order.phoneNumber, message);
        }
        console.log(`Payment ${paymentData.id} captured successfully.`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Webhook Handler Failed');
  }
};
