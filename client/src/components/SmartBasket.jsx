import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Heart, Check, X, Edit2, ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

export default function SmartBasket() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState(1);
  const dispatch = useDispatch();

  // Generate dummy predictions if backend doesn't have AI yet
  const generateDummyAI = () => [
    { id: 'ai1', name: 'Organic Milk', price: 65, predictedQuantity: 2, confidence: 94, image: '/milk.png' },
    { id: 'ai2', name: 'Fresh Apples', price: 120, predictedQuantity: 1, confidence: 88, image: '/apple.png' },
    { id: 'ai3', name: 'Whole Wheat Bread', price: 45, predictedQuantity: 1, confidence: 76, image: '/bread.png' },
  ];

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await axiosInstance.get('/ai/suggest-basket');
        setSuggestions(response.data.length ? response.data : generateDummyAI());
      } catch (error) {
        console.error("Failed to fetch AI suggestions:", error);
        setSuggestions(generateDummyAI());
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const handleAccept = (item) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.predictedQuantity
    }));
    setSuggestions(prev => prev.filter(s => s.id !== item.id));
  };

  const handleReject = (id) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditQty(item.predictedQuantity);
  };

  const saveEdit = (id) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, predictedQuantity: editQty } : s));
    setEditingId(null);
  };

  if (loading) return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 h-full min-h-[300px] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <Heart className="w-10 h-10 text-indigo-300 mb-4 fill-indigo-100" />
        <p className="text-indigo-800 font-medium">AI is analyzing your habits...</p>
      </div>
    </div>
  );

  if (suggestions.length === 0) return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 text-center h-full flex flex-col items-center justify-center">
      <Heart className="w-10 h-10 text-indigo-300 mb-4 fill-indigo-100" />
      <h3 className="font-bold text-indigo-900 mb-2">Smart Basket Empty</h3>
      <p className="text-sm text-indigo-700/70">Check back later for personalized grocery predictions based on your shopping patterns.</p>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-indigo-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900">Your Favourites</h3>
            <p className="text-xs text-indigo-700/70">Based on your shopping patterns</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <ul className="space-y-4">
          {suggestions.map(item => (
            <li key={item.id} className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded-md bg-gray-50" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">₹{item.price}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                        {item.confidence}% match
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={editQty}
                      onChange={(e) => setEditQty(parseInt(e.target.value) || 1)}
                      className="w-14 text-sm p-1 border rounded"
                    />
                    <button onClick={() => saveEdit(item.id)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Save</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">Qty: {item.predictedQuantity}</span>
                    <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-indigo-600 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button onClick={() => handleReject(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleAccept(item)} className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center gap-1">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
