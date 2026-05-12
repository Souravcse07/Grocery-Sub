const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const { sendSeasonalSwap } = require('../utils/emailService');

// Helper to determine current season in India
const getCurrentSeason = () => {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 5) return 'Summer';
  if (month >= 6 && month <= 9) return 'Monsoon';
  return 'Winter';
};

// Run on the 1st of every month at 9:00 AM
const startSeasonAlertJob = () => {
  cron.schedule('0 9 1 * *', async () => {
    console.log('[CRON] Running Seasonal Alert Job...');
    try {
      const currentSeason = getCurrentSeason();

      // Find all active subscriptions
      const subscriptions = await Subscription.find({
        status: { $nin: ['cancelled', 'paused'] }
      }).populate('userId');

      for (const sub of subscriptions) {
        try {
          const outOfSeasonItems = [];
          
          for (const item of sub.items) {
            const product = await Product.findById(item.productId);
            // If product has a specific season and it's not All Seasons and it's not the current season
            if (product && product.season && product.season !== 'All Seasons' && product.season !== currentSeason) {
              outOfSeasonItems.push(product.name);
            }
          }

          if (outOfSeasonItems.length > 0 && sub.userId && sub.userId.email) {
            await sendSeasonalSwap(sub.userId.email, outOfSeasonItems);
          }
        } catch (subErr) {
          console.error(`[CRON ERROR] Season alert failed for sub ${sub._id}:`, subErr.message);
        }
      }
      console.log('[CRON] Seasonal alerts checked and sent.');
    } catch (error) {
      console.error('[CRON ERROR] Season alert job failed:', error.message);
    }
  });
  console.log('✅ Season alert job scheduled (0 9 1 * *)');
};

module.exports = startSeasonAlertJob;
