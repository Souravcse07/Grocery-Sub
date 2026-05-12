import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function DeliverySlotPicker({ onSelectSlot }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Generate 7 days of dummy slots if backend fails
  const generateDummySlots = () => {
    const days = [];
    const times = ['08:00 AM - 11:00 AM', '12:00 PM - 03:00 PM', '04:00 PM - 07:00 PM'];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1); // Start from tomorrow
      days.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        slots: times.map((time, idx) => ({
          id: `${date.getTime()}-${idx}`,
          time,
          fillRate: Math.floor(Math.random() * 100) // Random fill rate 0-100%
        }))
      });
    }
    return days;
  };

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await axiosInstance.get('/slots/available');
        
        // Group raw flat slots into days format
        if (response.data && response.data.length > 0) {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          const todayStr = `${year}-${month}-${day}`;

          const validSlots = response.data.filter(slot => {
            if (slot.date < todayStr) return false;
            if (slot.date === todayStr) {
              const startTimeStr = slot.timeRange.split(' - ')[0];
              const timeMatch = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
              if (timeMatch) {
                let hours = parseInt(timeMatch[1], 10);
                const minutes = parseInt(timeMatch[2], 10);
                const ampm = timeMatch[3].toUpperCase();
                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
                
                const slotTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
                if (now > slotTime) return false;
              }
            }
            return true;
          });

          if (validSlots.length > 0) {
            const grouped = {};
            validSlots.forEach(slot => {
              if (!grouped[slot.date]) grouped[slot.date] = { date: slot.date, displayDate: new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), slots: [] };
              grouped[slot.date].slots.push({
                id: slot._id,
                time: slot.timeRange,
                fillRate: Math.floor((slot.booked / slot.capacity) * 100),
                isFull: slot.booked >= slot.capacity
              });
            });
            setSlots(Object.values(grouped));
          } else {
            setSlots(generateDummySlots());
          }
        } else {
          setSlots(generateDummySlots());
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error);
        setSlots(generateDummySlots());
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  const handleSelect = async (day, slot) => {
    setSelectedSlot(slot.id);
    try {
      // POST /api/slots/book
      await axiosInstance.post('/slots/book', { date: day.date, timeRange: slot.time });
    } catch (e) {
      console.error("Failed to book slot on backend", e);
    }
    // Pass selected slot data up to parent
    onSelectSlot({ date: day.date, displayDate: day.displayDate, time: slot.time, id: slot.id });
  };

  const getFillColor = (rate) => {
    if (rate > 80) return 'bg-red-50 border-red-200 text-red-700'; // High fill, almost full
    if (rate > 40) return 'bg-yellow-50 border-yellow-200 text-yellow-700'; // Medium
    return 'bg-green-50 border-green-200 text-green-700'; // Low fill, plenty available
  };

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading delivery slots...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
        <CalendarIcon className="w-5 h-5 text-green-600" /> Choose Delivery Slot
      </h3>
      
      <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide">
        {slots.map((day, idx) => (
          <div key={idx} className="min-w-[200px] border border-gray-100 rounded-xl overflow-hidden shrink-0">
            <div className="bg-gray-50 py-3 px-4 border-b border-gray-100 text-center font-semibold text-gray-800">
              {day.displayDate}
            </div>
            <div className="p-4 flex flex-col gap-3">
              {day.slots.map(slot => {
                const isSelected = selectedSlot === slot.id;
                const isFull = slot.fillRate >= 100;
                
                return (
                  <button
                    key={slot.id}
                    disabled={isFull}
                    onClick={() => handleSelect(day, slot)}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all duration-200 flex flex-col gap-1
                      ${isSelected ? 'ring-2 ring-green-500 border-green-500 shadow-md bg-green-50/50' : 'hover:shadow-sm hover:-translate-y-0.5'}
                      ${isFull ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed' : getFillColor(slot.fillRate)}
                    `}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="w-3.5 h-3.5 opacity-70" /> {slot.time}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                      {isFull ? 'Fully Booked' : slot.fillRate > 80 ? 'Filling Fast' : 'Available'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
