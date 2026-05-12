import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axiosInstance from '../api/axiosInstance';
import { Package, Users, TrendingUp, RefreshCw, Truck, Edit, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'react-hot-toast';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [products, setProducts] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    pricePerUnit: '',
    unit: '',
    inStock: true
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ordersRes, analyticsRes, productsRes, usersRes] = await Promise.all([
        axiosInstance.get('/orders/all'),
        axiosInstance.get('/orders/analytics'),
        axiosInstance.get('/products'),
        axiosInstance.get('/auth/users')
      ]);
      setOrders(ordersRes.data);
      setAnalytics(analyticsRes.data);
      setProducts(productsRes.data);
      setUsersList(usersRes.data);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      // toast is handled by interceptor
    }
  };

  const handleStockToggle = async (productId, currentStock) => {
    try {
      const { data } = await axiosInstance.put(`/products/${productId}`, { inStock: !currentStock });
      setProducts(products.map(p => p._id === productId ? data : p));
      toast.success(data.inStock ? 'Item is now In Stock' : 'Item is Out of Stock');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axiosInstance.delete(`/products/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Product deleted');
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({ name: '', category: '', pricePerUnit: '', unit: '', inStock: true });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      pricePerUnit: prod.pricePerUnit,
      unit: prod.unit,
      inStock: prod.inStock
    });
    setIsModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      // using FormData to match backend that expects multipart or json
      // but backend says normalizeBodyKeys so json should work if no images
      if (editingProduct) {
        const { data } = await axiosInstance.put(`/products/${editingProduct._id}`, productForm);
        setProducts(products.map(p => p._id === editingProduct._id ? data : p));
        toast.success('Product updated');
      } else {
        const { data } = await axiosInstance.post('/products', productForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProducts([data, ...products]);
        toast.success('Product added');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="bg-gray-900 text-white p-2 rounded-xl"><Users className="w-6 h-6" /></span>
            Admin Dashboard
          </h1>
          <button onClick={fetchAdminData} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
          {['orders', 'analytics', 'products', 'users', 'subscriptions', 'slots'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-bold capitalize whitespace-nowrap transition-colors shadow-sm ${
                activeTab === tab ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab === 'slots' ? 'Delivery Slots' : tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" /> All Orders
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold rounded-tl-xl">Order ID</th>
                        <th className="p-4 font-semibold">Date</th>
                        <th className="p-4 font-semibold">Customer</th>
                        <th className="p-4 font-semibold">Total</th>
                        <th className="p-4 font-semibold">Payment</th>
                        <th className="p-4 font-semibold rounded-tr-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-mono text-sm text-gray-600">#{order.id.substring(0,8).toUpperCase()}</td>
                          <td className="p-4 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="p-4">
                            <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                            <p className="text-xs text-gray-500">{order.user?.email || ''}</p>
                          </td>
                          <td className="p-4 font-bold">₹{order.total.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="p-4">
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`p-2 rounded-lg text-sm font-bold border outline-none cursor-pointer ${
                                order.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                                order.status === 'In Transit' || order.status === 'Out_for_delivery' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                'bg-yellow-50 border-yellow-200 text-yellow-700'
                              }`}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Out_for_delivery">Out for Delivery</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Failed">Failed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-500">No orders found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" /> Product Inventory
                  </h2>
                  <button onClick={openAddModal} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold rounded-tl-xl">Product</th>
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold">Price</th>
                        <th className="p-4 font-semibold">Stock Status</th>
                        <th className="p-4 font-semibold rounded-tr-xl text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(prod => (
                        <tr key={prod._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-gray-900">{prod.name}</p>
                          </td>
                          <td className="p-4 text-sm text-gray-600">{prod.category}</td>
                          <td className="p-4 font-bold text-gray-900">₹{prod.pricePerUnit} / {prod.unit}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handleStockToggle(prod._id, prod.inStock)}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${prod.inStock ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                            >
                              {prod.inStock ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {prod.inStock ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </td>
                          <td className="p-4 flex justify-end gap-2">
                            <button onClick={() => openEditModal(prod)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(prod._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-500">No products found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" /> Users Data
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold rounded-tl-xl">Name</th>
                        <th className="p-4 font-semibold">Email</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold rounded-tr-xl">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {usersList.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-bold text-gray-900">{user.name}</td>
                          <td className="p-4 text-gray-600">{user.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {usersList.length === 0 && (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No users found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" /> 30-Day Revenue
                </h2>
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="_id" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip 
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`₹${value}`, 'Revenue']}
                      />
                      <Bar dataKey="totalRevenue" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* OTHER TABS */}
            {['subscriptions', 'slots'].includes(activeTab) && (
              <div className="p-12 text-center">
                <Truck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400">Section Under Construction</h3>
                <p className="text-gray-400">The {activeTab} management panel is coming soon.</p>
              </div>
            )}

          </div>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <input required type="text" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
                  <input required type="number" value={productForm.pricePerUnit} onChange={e => setProductForm({...productForm, pricePerUnit: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
                  <input required type="text" placeholder="e.g. kg, pack" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="inStock" checked={productForm.inStock} onChange={e => setProductForm({...productForm, inStock: e.target.checked})} className="w-4 h-4 text-gray-900 rounded focus:ring-gray-900" />
                <label htmlFor="inStock" className="font-bold text-gray-700">In Stock</label>
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white rounded-xl py-3 font-bold mt-4 hover:bg-gray-800 transition-colors">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
