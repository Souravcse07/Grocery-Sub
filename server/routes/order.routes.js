const express = require('express');
const { body } = require('express-validator');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const orderController = require('../controllers/order.controller');
const validate = require('../middleware/validate');

const router = express.Router();

// Admin routes
router.get('/all', verifyToken, isAdmin, orderController.getAllOrders);
router.get('/analytics', verifyToken, isAdmin, orderController.getOrderAnalytics);
router.put('/:id/status',
  verifyToken,
  isAdmin,
  [
    body('status').isIn(['Processing', 'Confirmed', 'Out_for_delivery', 'Delivered', 'In Transit', 'Failed', 'Cancelled']).withMessage('Invalid status')
  ],
  validate,
  orderController.updateOrderStatus
);

// User routes
router.get('/', verifyToken, orderController.getOrders);
router.post('/', verifyToken, orderController.createOrder);
router.post('/verify-payment', verifyToken, orderController.verifyPayment);
router.put('/:id/cancel', verifyToken, orderController.cancelOrder);

module.exports = router;