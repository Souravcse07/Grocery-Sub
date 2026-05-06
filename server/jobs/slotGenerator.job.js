const cron = require('node-cron');
const DeliverySlot = require('../models/DeliverySlot');

// Run every day at 6:00 AM
const startSlotGeneratorJob = () => {
  cron.schedule('0 6 * * *', async () => {
    console.log('[CRON] Running Delivery Slot Generator...');
    try {
      const timeRanges = [
        '08:00 AM - 11:00 AM',
        '12:00 PM - 03:00 PM',
        '04:00 PM - 07:00 PM'
      ];

      for (let i = 1; i <= 7; i++) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i);
        const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Expiration is end of target day
        const expiresAt = new Date(targetDate);
        expiresAt.setHours(23, 59, 59, 999);

        for (const timeRange of timeRanges) {
          // Upsert slot
          await DeliverySlot.updateOne(
            { date: dateString, timeRange },
            { 
              $setOnInsert: { 
                capacity: 10, // Default capacity
                booked: 0,
                expiresAt 
              } 
            },
            { upsert: true }
          );
        }
      }
      console.log('[CRON] Delivery slots generated for next 7 days.');
    } catch (error) {
      console.error('[CRON ERROR] Slot generation failed:', error.message);
    }
  });
  console.log('✅ Slot generator job scheduled (0 6 * * *)');
};

module.exports = startSlotGeneratorJob;
