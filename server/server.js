const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

const app = express();

// Auth routes
const authRoutes = require('./routes/auth.routes');
const testRoutes = require('./routes/test.routes');
const productRoutes = require('./routes/product.routes');

// Connect DB
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mount auth routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/products', productRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🌿 FreshBox API is running' });
});


startServer();