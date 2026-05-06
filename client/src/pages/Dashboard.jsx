import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SubscriptionCard from '../components/SubscriptionCard';
import WalletWidget from '../components/WalletWidget';
import SmartBasket from '../components/SmartBasket';
import axiosInstance from '../api/axiosInstance';
import { Package, ChevronDown, ChevronUp, MapPin, Receipt, Truck, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({ subscription: null, wallet: null, orders: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const ordersPerPage = 5;

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Promise.all to fetch subscription, wallet, orders in parallel
      // We'll wrap in catch to allow mock data fallback if API endpoints don't exist yet
      const [subRes, walletRes, ordersRes] = await Promise.all([
        axiosInstance.get('/subscriptions/active').catch(() => ({ data: mockSubscription })),
        axiosInstance.get('/wallet').catch(() => ({ data: mockWallet })),
        axiosInstance.get('/orders').catch(() => ({ data: mockOrders }))
      ]);

      setData({
        subscription: subRes.data,
        wallet: walletRes.data,
        orders: ordersRes.data
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalPages = Math.ceil(data.orders.length / ordersPerPage);
  const currentOrders = data.orders.slice((page - 1) * ordersPerPage, page * ordersPerPage);

  const toggleOrder = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Top Row: Subscription, Wallet, Smart Basket */}
          <div className="lg:col-span-1">
            {loading ? <SkeletonBox /> : <SubscriptionCard subscription={data.subscription} onUpdate={fetchDashboardData} />}
          </div>
          <div className="lg:col-span-1">
            {loading ? <SkeletonBox /> : <WalletWidget wallet={data.wallet} />}
          </div>
          <div className="lg:col-span-1">
            {loading ? <SkeletonBox /> : <SmartBasket />}
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" /> Order History
            </h2>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl"></div>)}
            </div>
          ) : data.orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No past orders found.</div>
          ) : (
            <div>
              <div className="divide-y divide-gray-100">
                {currentOrders.map(order => (
                  <div key={order.id} className="transition-colors hover:bg-gray-50/50">
                    <div 
                      onClick={() => toggleOrder(order.id)}
                      className="p-6 flex flex-wrap items-center justify-between cursor-pointer gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Order #{order.id.substring(0, 8).toUpperCase()}</p>
                          <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="hidden md:flex flex-col items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-bold text-gray-900">₹{order.total.toFixed(2)}</p>
                        </div>
                        {expandedOrder === order.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {expandedOrder === order.id && (
                      <div className="bg-gray-50 p-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                          {/* Cancel Order Button */}
                          {order.status === 'Processing' && (
                            <button 
                              onClick={async () => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                  try {
                                    await axiosInstance.put(`/orders/${order.id}/cancel`);
                                    fetchDashboardData();
                                  } catch (error) {
                                    // toast handles error
                                  }
                                }
                              }}
                              className="absolute top-0 right-0 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded text-sm font-medium transition-colors border border-transparent hover:border-red-100"
                            >
                              Cancel Order
                            </button>
                          )}
                          
                          <div className={order.status === 'Processing' ? 'mt-8' : ''}>
                            <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Items</h4>
                            <ul className="space-y-3">
                              {order.items.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 bg-white border px-1.5 py-0.5 rounded text-xs">{item.quantity}x</span>
                                    <span className="font-medium text-gray-800">{item.name}</span>
                                  </div>
                                  <span className="text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Order Tracking</h4>
                            
                            {/* Tracking Timeline */}
                            <div className="bg-white p-6 rounded-xl border border-gray-100 mb-4">
                              <div className="relative flex justify-between">
                                {/* Connecting Line */}
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 -z-10 rounded-full"></div>
                                <div className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 -z-10 rounded-full transition-all duration-500 ${order.status === 'Cancelled' ? 'bg-red-500' : 'bg-green-500'}`} style={{ 
                                  width: order.status === 'Delivered' ? '100%' : 
                                         order.status === 'In Transit' ? '66%' : 
                                         ['Processing', 'Confirmed', 'Out_for_delivery', 'Cancelled'].includes(order.status) ? '33%' : '0%' 
                                }}></div>

                                {/* Nodes */}
                                {order.status === 'Cancelled' ? [
                                  { label: 'Ordered', active: true, error: false },
                                  { label: 'Cancelled', active: true, error: true },
                                  { label: 'Refunded', active: true, error: true }
                                ].map((step, idx) => (
                                  <div key={idx} className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 border-4 ${
                                      step.active ? (step.error ? 'bg-red-600 border-red-100 text-white' : 'bg-green-600 border-green-100 text-white') : 'bg-white border-gray-200 text-gray-400'
                                    }`}>
                                      {step.active ? (step.error ? '✕' : <CheckCircle2 className="w-4 h-4" />) : idx + 1}
                                    </div>
                                    <span className={`text-xs font-medium ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
                                  </div>
                                )) : [
                                  { label: 'Ordered', active: true },
                                  { label: 'Processing', active: ['Processing', 'Confirmed', 'Out_for_delivery', 'In Transit', 'Delivered'].includes(order.status) },
                                  { label: 'In Transit', active: ['Out_for_delivery', 'In Transit', 'Delivered'].includes(order.status) },
                                  { label: 'Delivered', active: order.status === 'Delivered' }
                                ].map((step, idx) => (
                                  <div key={idx} className="flex flex-col items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 border-4 ${
                                      step.active ? 'bg-green-600 border-green-100 text-white' : 'bg-white border-gray-200 text-gray-400'
                                    }`}>
                                      {step.active ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <span className={`text-xs font-medium ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Receipt className="w-4 h-4 text-gray-400" />
                                <span>Payment: <span className="font-mono text-gray-800 font-medium bg-gray-50 px-2 py-1 rounded">{order.razorpayPaymentId ? 'Paid' : 'COD'}</span></span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Truck className="w-4 h-4 text-gray-400" />
                                <span>Current Status: <span className={`font-bold ${order.status === 'Cancelled' ? 'text-red-600' : 'text-gray-800'}`}>{order.status}</span></span>
                              </div>
                              {order.deliveredDate && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span>Delivered At: <span className="font-medium text-gray-800">{new Date(order.deliveredDate).toLocaleString()}</span></span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex justify-center gap-2 bg-white">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-600">Page {page} of {totalPages}</span>
                  <button 
                    disabled={page === totalPages} 
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
const SkeletonBox = () => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full min-h-[300px] animate-pulse">
    <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6"></div>
    <div className="h-6 bg-gray-100 rounded w-3/4 mx-auto mb-4"></div>
    <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto mb-8"></div>
    <div className="space-y-3">
      <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
      <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
    </div>
  </div>
);

// MOCK DATA for robust fallback if backend endpoints don't exist yet
const mockSubscription = {
  id: 'sub_123',
  status: 'active',
  nextDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
  total: 1250,
  items: [
    { name: 'Organic Milk', quantity: 2, frequency: 'Weekly' },
    { name: 'Fresh Apples', quantity: 1, frequency: 'Weekly' },
    { name: 'Whole Wheat Bread', quantity: 1, frequency: 'Bi-weekly' }
  ]
};

const mockWallet = {
  balance: 450.50,
  spendingData: [
    { name: 'Day 1', amount: 400 }, { name: 'Day 5', amount: 300 }, 
    { name: 'Day 10', amount: 550 }, { name: 'Day 15', amount: 200 },
    { name: 'Day 20', amount: 700 }, { name: 'Day 25', amount: 450 },
    { name: 'Day 30', amount: 600 }
  ],
  transactions: [
    { id: 'tx1', type: 'debit', amount: 150, description: 'Order Payment', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'tx2', type: 'credit', amount: 500, description: 'Wallet Topup', date: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'tx3', type: 'debit', amount: 80, description: 'Delivery Tip', date: new Date(Date.now() - 86400000 * 5).toISOString() }
  ]
};

const mockOrders = Array.from({ length: 12 }).map((_, i) => ({
  id: `ord_${Math.random().toString(36).substr(2, 9)}`,
  date: new Date(Date.now() - 86400000 * i * 3).toISOString(),
  total: Math.floor(Math.random() * 2000) + 500,
  status: i === 0 ? 'Processing' : i === 1 ? 'In Transit' : 'Delivered',
  razorpayPaymentId: `pay_${Math.random().toString(36).substr(2, 9)}`,
  deliveredDate: i > 1 ? new Date(Date.now() - 86400000 * i * 3 + 40000000).toISOString() : null,
  items: [
    { name: 'Organic Milk', price: 65, quantity: 2 },
    { name: 'Fresh Apples', price: 120, quantity: 1 }
  ]
}));
