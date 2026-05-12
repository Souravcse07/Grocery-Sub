require("dotenv").config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Auth routes
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const productRoutes = require('./routes/product.routes');
const subscriptionRoutes = require('./routes/subscription.routes');

// Cron Jobs
const startBillingJob = require('./jobs/billing.job');
const startSlotGeneratorJob = require('./jobs/slotGenerator.job');
const startSeasonAlertJob = require('./jobs/seasonAlert.job');

// Connect DB
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
.then(() => {
   console.log("MongoDB Connected");

   app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
      
      // Start CRON jobs after server is up and DB is connected
      startBillingJob();
      startSlotGeneratorJob();
      startSeasonAlertJob();
   });
})
.catch((err) => {
   console.error("MongoDB Connection Error:");
   console.error(err);
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Webhook route needs raw body
app.use('/api/payments', require('./routes/payment.routes'));

app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/products', productRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/slots', require('./routes/deliveryslot.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/orders', require('./routes/order.routes'));

// Mock AI suggest endpoint
app.get('/api/ai/suggest-basket', (req, res) => {
  res.json([
    { id: 'ai1', name: 'Organic Milk', price: 65, predictedQuantity: 2, confidence: 94, image: '/milk.png' },
    { id: 'ai2', name: 'Fresh Apples', price: 120, predictedQuantity: 1, confidence: 88, image: '/apple.png' },
    { id: 'ai3', name: 'Whole Wheat Bread', price: 45, predictedQuantity: 1, confidence: 76, image: '/bread.png' },
  ]);
});

// Health check
app.get('/', (req, res) => {
   res.send("Backend Running");
});

// 404 Catch-All
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
});