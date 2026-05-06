const express = require('express');
const { body } = require('express-validator');
const verifyToken = require('../middleware/verifyToken');
const subscriptionController = require('../controllers/subscription.controller');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/', 
  verifyToken, 
  [
    body('items').isArray({ min: 1 }).withMessage('Items must be an array with at least 1 item'),
    body('nextDeliveryDate').notEmpty().withMessage('Next delivery date is required'),
    body('deliverySlotId').notEmpty().withMessage('Delivery slot ID is required')
  ],
  validate,
  subscriptionController.createSubscription
);

router.get('/active', verifyToken, subscriptionController.getActiveSubscription);
router.put('/:id/pause', verifyToken, subscriptionController.pauseSubscription);
router.put('/:id/cancel', verifyToken, subscriptionController.cancelSubscription);
router.put('/:id/skip', verifyToken, subscriptionController.skipNextDelivery);
router.put('/:id/resume', verifyToken, subscriptionController.resumeSubscription);

module.exports = router;

