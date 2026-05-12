const User = require('../models/User');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');
const razorpay = require('../config/razorpay');

const frequencyToInterval = (frequency) => {
  switch ((frequency || '').toLowerCase()) {
    case 'weekly':
      return 'weekly';
    case 'monthly':
      return 'monthly';
    default:
      return null;
  }
};

exports.createSubscription = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const {
      items,
      nextDeliveryDate,
      deliverySlotId,
      deliveryAddress = 'Address not provided',
      phoneNumber = '+919999999999',
      paymentMethod = 'Razorpay',
      walletCreditPerCycle = 0
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items must be a non-empty array' });
    }

    if (!nextDeliveryDate || !deliverySlotId) {
      return res
        .status(400)
        .json({ message: 'nextDeliveryDate and deliverySlotId are required' });
    }

    const parsedNextDeliveryDate = new Date(nextDeliveryDate);
    if (Number.isNaN(parsedNextDeliveryDate.getTime())) {
      return res.status(400).json({ message: 'nextDeliveryDate must be a valid date' });
    }

    const normalizedItems = items.map((i) => ({
      productId: i.productId,
      qty: Number(i.qty),
      frequency: String(i.frequency)
    }));

    if (normalizedItems.some((i) => !i.productId || !i.frequency || !Number.isFinite(i.qty) || i.qty < 1)) {
      return res.status(400).json({ message: 'Each item must include productId, qty (>=1), and frequency' });
    }

    // Allow mixed frequencies. Calculate a unified Monthly total and bill monthly.
    const interval = 'monthly';
    const frequency = 'mixed';

    const productIds = [...new Set(normalizedItems.map((i) => String(i.productId)))];
    const products = await Product.find({ _id: { $in: productIds }, isDeleted: false }).select('_id pricePerUnit');
    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'One or more products are invalid or deleted' });
    }
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const total = normalizedItems.reduce((sum, i) => {
      const product = productMap.get(String(i.productId));
      if (!product) throw new Error(`Product ${i.productId} not found in database`);
      
      const freq = i.frequency.toLowerCase();
      const multiplier = freq === 'weekly' ? 4 : freq === 'bi-weekly' ? 2 : 1;
      return sum + (product.pricePerUnit * i.qty * multiplier);
    }, 0);

    const credit = Number(walletCreditPerCycle) || 0;
    const amountToCharge = Number(total) - credit;

    if (!Number.isFinite(amountToCharge) || amountToCharge <= 0) {
      return res.status(400).json({ message: 'walletCreditPerCycle is too high; amount to charge must be > 0' });
    }

    const unitAmount = Math.round(amountToCharge * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return res.status(400).json({ message: 'Calculated subscription total must be > 0' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (paymentMethod === 'COD') {
      // Advance nextDeliveryDate so the midnight cron doesn't duplicate the first order
      const nextNextDate = new Date(parsedNextDeliveryDate);
      if (frequency.toLowerCase() === 'weekly') nextNextDate.setDate(nextNextDate.getDate() + 7);
      else if (frequency.toLowerCase() === 'bi-weekly') nextNextDate.setDate(nextNextDate.getDate() + 14);
      else if (frequency.toLowerCase() === 'monthly') nextNextDate.setMonth(nextNextDate.getMonth() + 1);

      const dbSubscription = await Subscription.create({
        userId: user._id,
        items: normalizedItems,
        status: 'active',
        razorpaySubscriptionId: 'COD',
        nextDeliveryDate: nextNextDate,
        deliverySlotId,
        deliveryAddress,
        phoneNumber,
        paymentMethod: 'COD',
        walletCreditPerCycle: Number(walletCreditPerCycle)
      });

      const Order = require('../models/Order');
      const newOrder = await Order.create({
        userId: dbSubscription.userId,
        subscriptionId: dbSubscription._id,
        items: dbSubscription.items,
        totalAmount: amountToCharge,
        status: 'Processing',
        deliveryAddress,
        phoneNumber
      });

      const twilio = require('twilio');
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      if (accountSid && authToken && phoneNumber) {
        try {
          const client = twilio(accountSid, authToken);
          await client.messages.create({
            body: `Success! Your FreshCart COD order #${newOrder._id.toString().slice(-6).toUpperCase()} is confirmed and will be delivered to: ${deliveryAddress.substring(0, 30)}...`,
            from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
            to: phoneNumber
          });
        } catch(e) { console.error("SMS Failed:", e.message); }
      } else {
        console.log(`[SMS MOCK] Success! Your FreshCart COD order #${newOrder._id.toString().slice(-6).toUpperCase()} is confirmed!`);
      }

      return res.status(201).json({ subscription: dbSubscription });
    }

    // 1. Create a Razorpay Plan for this dynamic amount
    const plan = await razorpay.plans.create({
      period: interval,
      interval: 1,
      item: {
        name: `FreshBox ${frequency} Subscription`,
        amount: unitAmount,
        currency: 'INR',
        description: 'Grocery Subscription Box'
      }
    });

    // 2. Create the Subscription using the Plan ID
    const rzpSubscription = await razorpay.subscriptions.create({
      plan_id: plan.id,
      customer_notify: 1,
      total_count: 12, // example: 12 billing cycles
      quantity: 1,
      notes: {
        userId: String(user._id)
      }
    });

    // 3. Save to DB
    const dbSubscription = await Subscription.create({
      userId: user._id,
      items: normalizedItems,
      status: rzpSubscription.status || 'created',
      razorpaySubscriptionId: rzpSubscription.id,
      razorpayPlanId: plan.id,
      nextDeliveryDate: parsedNextDeliveryDate,
      deliverySlotId,
      deliveryAddress,
      phoneNumber,
      paymentMethod: 'Razorpay',
      walletCreditPerCycle: Number(walletCreditPerCycle)
    });

    return res.status(201).json({
      short_url: rzpSubscription.short_url,
      subscription: dbSubscription
    });
  } catch (err) {
    console.error("Razorpay subscription error:", err);
    return next(err);
  }
};

exports.pauseSubscription = async (req, res, next) => {
  try {
    const subId = req.params.id;
    const subscription = await Subscription.findById(subId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    if (String(subscription.userId) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    // Store paused status in DB. The billing cron must check this and skip billing.
    subscription.status = 'paused';
    await subscription.save();

    res.json({ message: 'Subscription paused successfully', subscription });
  } catch (error) {
    next(error);
  }
};

exports.getActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Find a non-cancelled subscription
    const subscription = await Subscription.findOne({ 
      userId, 
      status: { $ne: 'cancelled' } 
    }).sort({ createdAt: -1 }).populate('items.productId', 'name pricePerUnit');
    
    if (!subscription) {
      return res.status(200).json(null);
    }
    
    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

exports.cancelSubscription = async (req, res, next) => {
  try {
    const subId = req.params.id;
    const subscription = await Subscription.findById(subId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    if (String(subscription.userId) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    // Cancel in Razorpay: cancel_at_cycle_end is natively true for standard cancels, or we can enforce it
    if (subscription.razorpaySubscriptionId) {
      await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId, { cancel_at_cycle_end: true });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({ message: 'Subscription cancelled successfully', subscription });
  } catch (error) {
    next(error);
  }
};

exports.skipNextDelivery = async (req, res, next) => {
  try {
    const subId = req.params.id;
    const subscription = await Subscription.findById(subId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    if (String(subscription.userId) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    // Advance nextDeliveryDate by frequency
    const currentNext = new Date(subscription.nextDeliveryDate);
    const frequency = subscription.items[0]?.frequency?.toLowerCase();
    
    if (frequency === 'weekly') {
      currentNext.setDate(currentNext.getDate() + 7);
    } else if (frequency === 'bi-weekly') {
      currentNext.setDate(currentNext.getDate() + 14);
    } else if (frequency === 'monthly') {
      currentNext.setMonth(currentNext.getMonth() + 1);
    } else {
      currentNext.setDate(currentNext.getDate() + 7); // Default
    }

    subscription.nextDeliveryDate = currentNext;
    await subscription.save();

    res.json({ message: 'Next delivery skipped', nextDeliveryDate: currentNext });
  } catch (error) {
    next(error);
  }
};

exports.resumeSubscription = async (req, res, next) => {
  try {
    const subId = req.params.id;
    const subscription = await Subscription.findById(subId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
    if (String(subscription.userId) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden' });

    if (subscription.status !== 'paused' && subscription.status !== 'cancelled') {
      return res.status(400).json({ message: 'Subscription is already active' });
    }

    // Since Razorpay cannot resume a cancelled/paused sub via API, create a NEW one with the same Plan ID
    if (!subscription.razorpayPlanId) {
      return res.status(400).json({ message: 'Original plan ID missing. Please create a new subscription.' });
    }

    const rzpSubscription = await razorpay.subscriptions.create({
      plan_id: subscription.razorpayPlanId,
      customer_notify: 1,
      total_count: 12,
      quantity: 1,
      notes: {
        userId: String(subscription.userId)
      }
    });

    subscription.razorpaySubscriptionId = rzpSubscription.id;
    subscription.status = rzpSubscription.status || 'created';
    await subscription.save();

    res.json({ 
      message: 'Subscription resumed', 
      short_url: rzpSubscription.short_url,
      subscription 
    });
  } catch (error) {
    next(error);
  }
};
