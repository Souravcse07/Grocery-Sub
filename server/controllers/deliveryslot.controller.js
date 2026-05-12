const DeliverySlot = require('../models/DeliverySlot');

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    const query = {};
    if (date) {
      query.date = date;
    }
    // Only return slots that are not fully booked
    query.$expr = { $lt: ['$booked', '$capacity'] };

    const slots = await DeliverySlot.find(query).sort({ date: 1, timeRange: 1 });
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

exports.bookSlot = async (req, res, next) => {
  try {
    const { date, timeRange } = req.body;
    
    if (!date || !timeRange) {
      return res.status(400).json({ message: 'Date and timeRange are required' });
    }

    let slot = await DeliverySlot.findOne({ date, timeRange });
    
    if (!slot) {
      // Create if it doesn't exist
      slot = new DeliverySlot({
        date,
        timeRange,
        capacity: 10,
        booked: 0,
        expiresAt: new Date(new Date(date).getTime() + 86400000)
      });
    }

    if (slot.booked >= slot.capacity) {
      return res.status(400).json({ message: 'Slot is fully booked' });
    }

    slot.booked += 1;
    await slot.save();

    res.json({ message: 'Slot booked successfully', slot });
  } catch (error) {
    next(error);
  }
};

exports.cancelSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Decrement booking
    const slot = await DeliverySlot.findOneAndUpdate(
      { _id: id, booked: { $gt: 0 } },
      { $inc: { booked: -1 } },
      { new: true }
    );

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found or already empty' });
    }

    res.json({ message: 'Slot booking cancelled', slot });
  } catch (error) {
    next(error);
  }
};
