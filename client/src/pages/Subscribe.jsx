import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import DeliverySlotPicker from '../components/DeliverySlotPicker';
import { useGetProductsQuery } from '../features/api/apiSlice';
import { CheckCircle2, ChevronRight, CreditCard, Leaf } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export default function Subscribe() {
  const cartItems = useSelector(state => state.cart.items);
  const [step, setStep] = useState(1);
  const { data, isLoading } = useGetProductsQuery({ limit: 100 });
  const [subscriptionItems, setSubscriptionItems] = useState(
    cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      frequency: 'Weekly'
    }))
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const allProducts = data?.products || data || [];

  const handleAddItem = (product) => {
    if (!subscriptionItems.find(i => i.id === product._id || i.id === product.id)) {
      setSubscriptionItems(prev => [...prev, {
        id: product._id || product.id,
        name: product.name,
        price: product.price || product.pricePerUnit,
        image: product.image,
        quantity: 1,
        frequency: 'Weekly' // Weekly, Bi-weekly, Monthly
      }]);
    }
  };

  const handleUpdateItem = (id, field, value) => {
    setSubscriptionItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemoveItem = (id) => {
    setSubscriptionItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate Running Total for 1 month (assuming 4 weeks/month)
  const calculateMonthlyTotal = () => {
    return subscriptionItems.reduce((total, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : item.price;
      const deliveriesPerMonth = item.frequency === 'Weekly' ? 4 : item.frequency === 'Bi-weekly' ? 2 : 1;
      return total + (price * item.quantity * deliveriesPerMonth);
    }, 0);
  };

  const handleRazorpayCheckout = async () => {
    // Dynamically load Razorpay script
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // 1. Create subscription on backend
      const address = document.getElementById('addressInput')?.value || 'Address not provided';
      const phone = document.getElementById('phoneInput')?.value || '+919999999999';
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Razorpay';

      const response = await axiosInstance.post('/subscriptions', { 
        items: subscriptionItems.map(i => ({ productId: i.id, qty: i.quantity, frequency: i.frequency })),
        nextDeliveryDate: selectedSlot.date,
        deliverySlotId: selectedSlot.id,
        deliveryAddress: address,
        phoneNumber: phone,
        paymentMethod
      });

      if (paymentMethod === 'COD') {
        setStep(4);
        return;
      }

      const { short_url, subscription } = response.data;

      // 2. Open Razorpay Checkout overlay for the mandate
      const options = {
        key: 'rzp_test_SkOmbhczc46lov', // Matches your server/.env RAZORPAY_KEY_ID
        subscription_id: subscription.razorpaySubscriptionId,
        name: 'FreshCart Subscriptions',
        description: 'Set up your recurring grocery delivery',
        image: '/favicon.svg',
        handler: function (paymentResponse) {
          console.log("Razorpay Payment Success:", paymentResponse);
          // The backend webhook will catch this and mark the subscription active!
          setStep(4);
        },
        prefill: {
          name: 'FreshCart User',
          email: 'user@freshcart.example.com',
          contact: phone
        },
        theme: {
          color: '#16a34a'
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        console.error("Payment Failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
      });
      
      paymentObject.open();

    } catch (error) {
      console.error("Failed to create subscription setup:", error);
      alert(error.response?.data?.message || 'Failed to initialize subscription checkout. Check console.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="bg-gradient-to-r from-green-800 to-emerald-700 text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Leaf className="w-8 h-8" /> Build Your Subscription Box
        </h1>
        <p className="text-green-100 max-w-2xl mx-auto text-lg">Fresh groceries delivered on your schedule. Set it and forget it.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 transition-all duration-500 -z-10" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[1, 2, 3].map(num => (
            <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors duration-300 ${step >= num ? 'bg-green-600 border-green-200 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
              {step > num ? <CheckCircle2 className="w-6 h-6" /> : num}
            </div>
          ))}
        </div>

        {step === 4 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscription Activated!</h2>
            <p className="text-gray-500 text-lg mb-8">Your fresh groceries will be delivered according to your schedule.</p>
            <button onClick={() => window.location.href = '/'} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition-all">
              Return Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              
              {/* Step 1: Items */}
              {step === 1 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 1: Choose Your Items</h2>
                  
                  {isLoading ? <p>Loading products...</p> : (
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select products to add to your box</label>
                      <select 
                        onChange={(e) => {
                          const prod = allProducts.find(p => (p._id || p.id).toString() === e.target.value);
                          if (prod) handleAddItem(prod);
                          e.target.value = "";
                        }}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      >
                        <option value="">-- Click to add a product --</option>
                        {allProducts.map(p => (
                          <option key={p._id || p.id} value={p._id || p.id}>{p.name} - ₹{p.price || p.pricePerUnit}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-4">
                    {subscriptionItems.length === 0 && <p className="text-center text-gray-400 py-6 border-2 border-dashed rounded-xl">No items added yet.</p>}
                    {subscriptionItems.map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <img src={item.image || '/produce.png'} alt={item.name} className="w-12 h-12 rounded-lg bg-gray-50 object-contain p-1" />
                          <div>
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">₹{item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <input 
                            type="number" 
                            min="1" 
                            value={item.quantity} 
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-16 p-2 border border-gray-200 rounded-lg text-center"
                          />
                          <select 
                            value={item.frequency}
                            onChange={(e) => handleUpdateItem(item.id, 'frequency', e.target.value)}
                            className="p-2 border border-gray-200 rounded-lg bg-gray-50"
                          >
                            <option value="Weekly">Weekly</option>
                            <option value="Bi-weekly">Bi-weekly</option>
                            <option value="Monthly">Monthly</option>
                          </select>
                          <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600 p-2">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      disabled={subscriptionItems.length === 0}
                      onClick={() => setStep(2)}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
                    >
                      Next Step <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Slots */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8">
                  <DeliverySlotPicker onSelectSlot={setSelectedSlot} />
                  <div className="mt-8 flex justify-between">
                    <button onClick={() => setStep(1)} className="text-gray-500 font-medium hover:text-gray-800">Back</button>
                    <button 
                      disabled={!selectedSlot}
                      onClick={() => setStep(3)}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
                    >
                      Proceed to Payment <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Delivery Details & Payment */}
              {step === 3 && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Delivery Details & Payment</h2>
                  
                  <div className="mb-8 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                      <textarea 
                        id="addressInput"
                        placeholder="123 FreshCart Street, Apartment 4B..."
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none h-24"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (For SMS Updates)</label>
                      <input 
                        type="tel"
                        id="phoneInput"
                        placeholder="+919999999999"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="radio" name="paymentMethod" value="Razorpay" defaultChecked className="w-5 h-5 text-green-600 focus:ring-green-500" />
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">Pay Online (Razorpay)</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="radio" name="paymentMethod" value="COD" className="w-5 h-5 text-green-600 focus:ring-green-500" />
                        <div className="flex items-center gap-2">
                          <span className="text-xl">💵</span>
                          <span className="font-semibold text-gray-900">Cash on Delivery</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl mb-8 flex items-start gap-4">
                    <CreditCard className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-blue-900">Secure Checkout</h3>
                      <p className="text-sm text-blue-700 mt-1">Your payment details are securely processed. You will be billed ₹{calculateMonthlyTotal().toFixed(2)} based on your selection.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button onClick={() => setStep(2)} className="text-gray-500 font-medium hover:text-gray-800">Back</button>
                    <button 
                      onClick={handleRazorpayCheckout}
                      className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full font-bold shadow-lg transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      Confirm Order & Pay ₹{calculateMonthlyTotal().toFixed(2)}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Subscription Summary</h3>
                
                <div className="space-y-3 mb-6">
                  {subscriptionItems.length === 0 ? <p className="text-sm text-gray-500 italic">No items selected yet</p> : null}
                  {subscriptionItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate pr-2">{item.quantity}x {item.name} <span className="text-xs bg-gray-100 px-1 rounded text-gray-500 ml-1">{item.frequency.charAt(0)}</span></span>
                      <span className="font-medium text-gray-900">₹{typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) * item.quantity : item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {selectedSlot && (
                  <div className="mb-6 p-3 bg-green-50 rounded-xl border border-green-100 text-sm">
                    <p className="font-semibold text-green-800 mb-1">Delivery Slot:</p>
                    <p className="text-green-700">{selectedSlot.displayDate}</p>
                    <p className="text-green-700 opacity-80">{selectedSlot.time}</p>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-gray-600 font-medium">Monthly Total</span>
                    <span className="text-2xl font-bold text-green-600">₹{calculateMonthlyTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-right">Includes delivery fees</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Utility to load Razorpay script
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}
