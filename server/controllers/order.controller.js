const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const razorpay = require('../config/razorpay');
const sendSMS = require('../utils/sendSMS');

exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).populate('items.productId', 'name price pricePerUnit').sort({ createdAt: -1 });
    
    // Map to the format expected by Dashboard
    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      date: order.createdAt,
      total: order.totalAmount,
      status: order.status,
      razorpayPaymentId: order.razorpayPaymentId,
      deliveredDate: order.deliveredDate,
      items: order.items.map(item => {
        // Handle both standalone orders (with name/price) and subscription auto-orders (with populated productId)
        const product = item.productId || {};
        return {
          name: item.name || product.name || 'Unknown Product',
          price: item.price || product.pricePerUnit || product.price || 0,
          quantity: item.qty || item.quantity || 1
        };
      })
    }));
    
    res.json(formattedOrders);
  } catch (error) {
    next(error);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { items, deliveryAddress, phoneNumber, paymentMethod = 'COD' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items must be a non-empty array' });
    }

    const normalizedItems = items.map((i) => ({
      productId: i.productId || i.id,
      qty: Number(i.quantity || i.qty),
    }));

    const productIds = [...new Set(normalizedItems.map((i) => String(i.productId)))];
    const products = await Product.find({ _id: { $in: productIds }, isDeleted: false });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    let totalAmount = 0;
    const orderItems = [];
    for (const i of normalizedItems) {
      const p = productMap.get(String(i.productId));
      if (!p) return res.status(400).json({ message: `Product ${i.productId} not found` });
      if (p.inStock === false) return res.status(400).json({ message: `Sorry, ${p.name} is currently out of stock` });
      
      const price = p.price || p.pricePerUnit;
      totalAmount += price * i.qty;
      orderItems.push({
        productId: p._id,
        name: p.name,
        price: price,
        quantity: i.qty
      });
    }

    let discountAmount = 0;
    if (totalAmount >= 800) {
      discountAmount += 199;
    }
    if (paymentMethod === 'Credit Card') {
      discountAmount += (totalAmount - discountAmount) * 0.10;
    }
    
    totalAmount = Math.round(totalAmount - discountAmount + 20); // Includes discounts and delivery charge

    if (paymentMethod === 'COD') {
      const newOrder = await Order.create({
        userId,
        items: orderItems,
        totalAmount,
        status: 'Processing',
        deliveryAddress,
        phoneNumber
      });

      if (phoneNumber) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const message = `Order Confirmed! Your FreshCart order #${newOrder._id.toString().slice(-6).toUpperCase()} is confirmed. Track it at: ${frontendUrl}/dashboard`;
        await sendSMS(phoneNumber, message);
      }

      return res.status(201).json({ order: newOrder });
    }

    // Razorpay flow
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `rcpt_${userId.toString().slice(-6)}_${Date.now()}`
    });

    const newOrder = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      status: 'Processing',
      deliveryAddress,
      phoneNumber,
      razorpayOrderId: rzpOrder.id
    });

    res.status(201).json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      dbOrderId: newOrder._id
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('items.productId', 'name price pricePerUnit')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => {
      const user = order.userId || {};
      return {
        id: order._id.toString(),
        user: { name: user.name, email: user.email },
        date: order.createdAt,
        total: order.totalAmount,
        status: order.status,
        paymentMethod: order.razorpayPaymentId ? 'Razorpay' : 'COD',
        deliveredDate: order.deliveredDate,
        items: order.items.map(item => {
          const product = item.productId || {};
          return {
            name: item.name || product.name || 'Unknown Product',
            price: item.price || product.pricePerUnit || product.price || 0,
            quantity: item.qty || item.quantity || 1
          };
        })
      };
    });
    
    res.json(formattedOrders);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.status = status;
    if (status === 'Delivered') {
      order.deliveredDate = new Date();
    }
    await order.save();
    
    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.getOrderAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const analytics = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          ordersCount: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'Processing') return res.status(400).json({ message: 'Only processing orders can be cancelled' });
    
    order.status = 'Cancelled';
    await order.save();
    
    if (order.phoneNumber) {
      await sendSMS(order.phoneNumber, "Your order is cancelled");
    }
    
    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test');
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: 'Processing', razorpayPaymentId: razorpay_payment_id },
      { new: true }
    );

    if (order && order.phoneNumber) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const message = `Order Confirmed! Your FreshCart order #${order._id.toString().slice(-6).toUpperCase()} is confirmed. Track it at: ${frontendUrl}/dashboard`;
      await sendSMS(order.phoneNumber, message);
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
