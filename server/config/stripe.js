const Stripe = require('stripe');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  // Avoid crashing server startup; controller will return a clear 500 error.
  console.warn('⚠️ STRIPE_SECRET_KEY is missing in environment variables');
  module.exports = null;
} else {
  module.exports = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20'
  });
}

