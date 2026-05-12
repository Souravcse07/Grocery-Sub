import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { clearCart } from '../store/cartSlice';
import { CheckCircle2, CreditCard, ShoppingBag, Plus, Edit2, Check, X } from 'lucide-react';
import { useCreateOrderMutation, useGetProfileQuery, useUpdateProfileMutation, useVerifyPaymentMutation } from '../features/api/apiSlice';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, totalPrice } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const { data: profile } = useGetProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');

  const [selectedAddress, setSelectedAddress] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddressText, setNewAddressText] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editAddressText, setEditAddressText] = useState('');

  // Set initial phone and address from profile
  useEffect(() => {
    if (profile) {
      if (profile.phoneNumbers?.length > 0 && !phone) setPhone(profile.phoneNumbers[0]);
      if (profile.addresses?.length > 0 && !selectedAddress && !isAddingNew) {
        setSelectedAddress(profile.addresses[0]);
      } else if (!profile.addresses || profile.addresses.length === 0) {
        setIsAddingNew(true);
      }
    }
  }, [profile]);

  let discountAmount = 0;
  if (totalPrice >= 800) {
    discountAmount += 199;
  }
  if (paymentMethod === 'Credit Card') {
    discountAmount += (totalPrice - discountAmount) * 0.10;
  }
  const finalTotal = Math.round(totalPrice - discountAmount + 20); // Includes delivery charge and discounts

  const handleCheckout = async () => {
    const finalAddress = isAddingNew ? newAddressText : selectedAddress;
    if (!finalAddress || !phone) {
      toast.error('Please provide delivery address and phone number.');
      return;
    }

    try {
      if (isAddingNew && newAddressText) {
        await updateProfile({ addresses: [...(profile?.addresses || []), newAddressText] }).unwrap();
      }
      if (phone && (!profile?.phoneNumbers || !profile.phoneNumbers.includes(phone))) {
        await updateProfile({ phoneNumbers: [...(profile?.phoneNumbers || []), phone] }).unwrap();
      }

      const orderData = {
        items: items.map(i => ({ id: i.id, quantity: i.quantity })),
        deliveryAddress: finalAddress,
        phoneNumber: phone,
        paymentMethod
      };

      const response = await createOrder(orderData).unwrap();

      if (paymentMethod === 'COD') {
        dispatch(clearCart());
        setStep(2);
        return;
      }

      // Razorpay Flow
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const options = {
        key: 'rzp_test_SkOmbhczc46lov', // Matches your server/.env RAZORPAY_KEY_ID
        amount: response.amount,
        currency: response.currency,
        order_id: response.orderId,
        name: 'FreshCart',
        description: 'Grocery Checkout',
        image: '/favicon.svg',
        handler: async function (paymentResponse) {
          console.log("Razorpay Payment Success:", paymentResponse);
          try {
            await verifyPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            }).unwrap();
            dispatch(clearCart());
            setStep(2);
          } catch (err) {
            console.error("Verification failed", err);
            toast.error("Payment verification failed. Please contact support.");
          }
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
      
      paymentObject.on('payment.failed', function (paymentResponse) {
        console.error("Payment Failed:", paymentResponse.error);
        toast.error(`Payment failed: ${paymentResponse.error.description}`);
      });
      
      paymentObject.open();

    } catch (error) {
      console.error("Checkout failed:", error);
      const msg = error.data?.message || error.message || error.error || JSON.stringify(error);
      toast.error(`Checkout failed: ${msg}`);
    }
  };

  if (items.length === 0 && step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 mt-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <button onClick={() => navigate('/shop')} className="bg-green-600 text-white px-6 py-3 rounded-full">
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <ShoppingBag className="w-8 h-8" /> Checkout
        </h1>
        <p className="text-gray-200 max-w-2xl mx-auto text-lg">Complete your order.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {step === 2 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-gray-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
            <p className="text-gray-500 text-lg mb-8">Your fresh groceries will be delivered soon.</p>
            <button onClick={() => navigate('/dashboard')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition-all">
              View Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Details & Payment</h2>
                
                <div className="mb-8 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-gray-900">Delivery Address</label>
                      {!isAddingNew && (
                        <button 
                          onClick={() => setIsAddingNew(true)} 
                          className="text-sm text-green-600 font-medium flex items-center gap-1 hover:text-green-700"
                        >
                          <Plus className="w-4 h-4" /> Add New Address
                        </button>
                      )}
                    </div>
                    
                    {profile?.addresses?.length > 0 && !isAddingNew && (
                      <div className="space-y-3 mb-4">
                        {profile.addresses.map((addr, index) => (
                          <div key={index} className={`border rounded-xl p-4 transition-all ${selectedAddress === addr ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-green-200'}`}>
                            {editingIndex === index ? (
                              <div className="flex flex-col gap-2">
                                <textarea 
                                  value={editAddressText}
                                  onChange={(e) => setEditAddressText(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-green-500"
                                  rows="2"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setEditingIndex(null)} className="text-gray-500 hover:text-gray-700 p-1"><X className="w-4 h-4" /></button>
                                  <button 
                                    onClick={async () => {
                                      if(!editAddressText.trim()) return;
                                      const newAddrs = [...profile.addresses];
                                      newAddrs[index] = editAddressText;
                                      await updateProfile({ addresses: newAddrs });
                                      setEditingIndex(null);
                                      if (selectedAddress === addr) setSelectedAddress(editAddressText);
                                    }} 
                                    className="text-green-600 hover:text-green-700 p-1"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-3">
                                <input 
                                  type="radio" 
                                  name="address" 
                                  checked={selectedAddress === addr} 
                                  onChange={() => setSelectedAddress(addr)}
                                  className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
                                />
                                <p className="text-sm text-gray-700 flex-1">{addr}</p>
                                <button 
                                  onClick={() => { setEditingIndex(index); setEditAddressText(addr); }}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {isAddingNew && (
                      <div className="border border-green-200 bg-green-50/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-xs font-semibold text-green-800 mb-2 uppercase tracking-wider">New Address</label>
                        <textarea 
                          value={newAddressText}
                          onChange={(e) => setNewAddressText(e.target.value)}
                          placeholder="123 FreshCart Street, Apartment 4B..."
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none h-24 mb-3 bg-white"
                        ></textarea>
                        {profile?.addresses?.length > 0 && (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setIsAddingNew(false); setNewAddressText(''); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
                            <button 
                              onClick={async () => {
                                if(!newAddressText.trim()) return;
                                await updateProfile({ addresses: [...profile.addresses, newAddressText] });
                                setSelectedAddress(newAddressText);
                                setIsAddingNew(false);
                                setNewAddressText('');
                              }}
                              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                            >
                              Save Address
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (For Updates)</label>
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+919999999999"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>
                </div>

                  <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className={`flex flex-col gap-2 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Credit Card' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" name="paymentMethod" value="Credit Card" checked={paymentMethod === 'Credit Card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">Credit Card</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded w-max ml-8">10% OFF</span>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Razorpay' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="paymentMethod" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏦</span>
                        <span className="font-semibold text-gray-900">UPI / Netbanking</span>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                      <div className="flex items-center gap-2">
                        <span className="text-xl">💵</span>
                        <span className="font-semibold text-gray-900">Cash on Delivery</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <button onClick={() => navigate('/cart')} className="text-gray-500 font-medium hover:text-gray-800">Back to Cart</button>
                  <button 
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="bg-gray-900 hover:bg-black disabled:bg-gray-500 text-white px-8 py-4 rounded-full font-bold shadow-lg transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    {isLoading ? 'Processing...' : `Confirm Order & Pay ₹${finalTotal}`}
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate pr-2">{item.quantity}x {item.name}</span>
                      <span className="font-medium text-gray-900">₹{item.totalPrice}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium text-gray-900">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="font-medium text-gray-900">₹20</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm mb-4 text-green-600">
                      <span className="font-medium">Total Discount</span>
                      <span className="font-bold">-₹{Math.round(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end mb-1 pt-2 border-t border-dashed border-gray-200">
                    <span className="text-gray-900 font-bold">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">₹{finalTotal}</span>
                  </div>
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
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
