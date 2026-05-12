import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity } from '../store/cartSlice';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Trash2, ArrowLeft, Plus, Minus } from 'lucide-react';

export default function Cart() {
  const { items, totalPrice } = useSelector(state => state.cart);
  const dispatch = useDispatch();

  const getProductImage = (item) => {
    if (item.image && item.image.trim() !== '') return item.image;
    const name = (item.name || '').toLowerCase();
    if (name.includes('apple')) return '/apple.png';
    if (name.includes('milk') || name.includes('dairy')) return '/milk.png';
    if (name.includes('bread') || name.includes('bakery')) return '/bread.png';
    return '/produce.png';
  };

  const handleUpdateQty = (id, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty > 0) {
      dispatch(updateQuantity({ id, quantity: newQty }));
    } else {
      dispatch(removeFromCart(id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-gray-500 hover:text-green-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        </div>
        
        {items.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
            <p className="text-gray-500 text-lg mb-4">Your cart is completely empty.</p>
            <Link to="/shop" className="inline-block bg-green-600 text-white px-6 py-3 rounded-full font-medium hover:bg-green-700 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <ul className="divide-y divide-gray-100">
              {items.map(item => (
                <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img src={getProductImage(item)} alt={item.name} className="w-16 h-16 object-contain bg-gray-50 rounded-lg p-2 border border-gray-100" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center bg-gray-100 rounded-full">
                      <button onClick={() => handleUpdateQty(item.id, item.quantity, -1)} className="p-2 text-gray-600 hover:text-green-600 transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.id, item.quantity, 1)} className="p-2 text-gray-600 hover:text-green-600 transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                    
                    <span className="font-bold text-gray-900 w-16 text-right">₹{item.totalPrice}</span>
                    <button 
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="text-red-400 hover:text-red-600 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="text-xl font-medium text-gray-900">₹{totalPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery Fee</p>
                  <p className="text-xl font-medium text-gray-900">₹20</p>
                </div>
                {totalPrice >= 800 && (
                  <div>
                    <p className="text-sm text-green-600 font-bold">Discount</p>
                    <p className="text-xl font-bold text-green-600">-₹199</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Estimated Total</p>
                  <p className="text-2xl font-bold text-green-600">₹{totalPrice >= 800 ? totalPrice - 199 + 20 : totalPrice + 20}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => dispatch(clearCart())}
                  className="px-6 py-3 text-red-600 font-medium hover:bg-red-50 rounded-full transition-colors"
                >
                  Clear Cart
                </button>
                <Link to="/checkout" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold shadow-md transition-all hover:-translate-y-0.5 inline-block">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
