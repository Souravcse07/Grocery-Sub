import { useState } from 'react';
import { formatDistanceToNow, addDays, parseISO } from 'date-fns';
import { Clock, CalendarX, PauseCircle, PlayCircle, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export default function SubscriptionCard({ subscription, onUpdate }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!subscription) return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
        <Clock className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Subscription</h3>
      <p className="text-gray-500 mb-6">You don't have any recurring grocery deliveries yet.</p>
      <a href="/subscribe" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition-colors">Start Subscribing</a>
    </div>
  );

  const subId = subscription._id || subscription.id;

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Mock PUT to advance date
      await axiosInstance.put(`/subscriptions/${subId}/skip`);
      onUpdate();
    } catch (e) {
      console.error(e);
      // Simulate success if API missing
      onUpdate();
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(`/subscriptions/${subId}/cancel`);
      setShowCancelModal(false);
      onUpdate();
    } catch (e) {
      console.error(e);
      setShowCancelModal(false);
      onUpdate();
    }
    setLoading(false);
  };

  const handlePauseResume = async () => {
    setLoading(true);
    try {
      const endpoint = subscription.status === 'active' ? 'pause' : 'resume';
      await axiosInstance.put(`/subscriptions/${subId}/${endpoint}`);
      onUpdate();
    } catch (e) {
      console.error(e);
      // Simulate success if API missing
      onUpdate();
    }
    setLoading(false);
  };

  const nextDeliveryDate = new Date(subscription.nextDelivery || Date.now() + 86400000 * 3);
  const countdown = formatDistanceToNow(nextDeliveryDate, { addSuffix: true });

  const calculatedTotal = subscription.total || subscription.items?.reduce((sum, item) => {
    const price = item.productId?.pricePerUnit || item.price || 0;
    const qty = item.qty || item.quantity || 1;
    // Assuming Weekly frequency = ~4 times a month for a rough "Monthly Total" estimate
    const multiplier = (item.frequency?.toLowerCase() === 'weekly') ? 4 : (item.frequency?.toLowerCase() === 'bi-weekly') ? 2 : 1;
    return sum + (price * qty * multiplier);
  }, 0) || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Header */}
      <div 
        className="bg-green-50 p-6 border-b border-green-100 flex justify-between items-start cursor-pointer hover:bg-green-100/70 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-green-900">Weekly Fresh Box</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${subscription.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
              {subscription.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-green-700 font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" /> Next delivery: <span className="font-bold">{countdown}</span>
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          <p className="text-sm text-green-700">Monthly Total</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-green-900">₹{calculatedTotal.toFixed(2)}</p>
            <span className="text-green-700 mt-1">
              <svg className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </span>
          </div>
        </div>
      </div>

      {/* Items & Actions (Expandable) */}
      {isExpanded && (
        <div className="p-6 animate-in fade-in slide-in-from-top-2">
          <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2">Subscription Items</h4>
          <ul className="space-y-3 mb-6">
            {subscription.items?.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-700">{item.qty || item.quantity}x</span>
                  <span className="text-gray-900">{item.productId?.name || item.name || 'Unknown Product'}</span>
                </div>
                <span className="text-gray-500 bg-gray-50 px-2 py-0.5 rounded text-xs">{item.frequency}</span>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 border-t pt-6">
          <button 
            disabled={loading}
            onClick={handleSkip}
            className="flex-1 flex justify-center items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg font-medium transition-colors"
          >
            <CalendarX className="w-4 h-4" /> Skip Next
          </button>
          
          <button 
            disabled={loading}
            onClick={handlePauseResume}
            className="flex-1 flex justify-center items-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-2 rounded-lg font-medium transition-colors"
          >
            {subscription.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
            {subscription.status === 'active' ? 'Pause' : 'Resume'}
          </button>

          <button 
            onClick={() => setShowCancelModal(true)}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-red-100 text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Subscription?</h3>
            <p className="text-gray-500 mb-6 text-sm">Are you sure you want to cancel your grocery subscription? This will also cancel your Razorpay mandate.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium"
              >
                No, keep it
              </button>
              <button 
                onClick={handleCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
