import { Plus, Star, Leaf, ShoppingCart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };

  const getProductImage = () => {
    if (product.image && product.image.trim() !== '') return product.image;
    if (product.images && product.images.length > 0 && product.images[0].trim() !== '') return product.images[0];
    const name = (product.name || '').toLowerCase();
    if (name.includes('apple')) return '/apple.png';
    if (name.includes('milk') || name.includes('dairy')) return '/milk.png';
    if (name.includes('bread') || name.includes('bakery')) return '/bread.png';
    if (name.includes('rock salt')) return '/rock_salt.png';
    if (name.includes('carrot')) return '/carrot.png';
    if (name.includes('spinach')) return '/spinach.png';
    if (name.includes('potato')) return '/potato.png';
    if (name.includes('tomato')) return '/tomato.png';
    if (name.includes('banana')) return '/banana.png';
    if (name.includes('mango')) return '/mango.png';
    if (name.includes('papaya juice')) return '/papaya.png'; // Will use papaya image
    if (name.includes('papaya')) return '/papaya.png';
    if (name.includes('yogurt')) return '/yogurt.png';
    if (name.includes('paneer')) return '/paneer.png';
    if (name.includes('butter')) return '/butter.png';
    if (name.includes('oil')) return '/oil.png';
    if (name.includes('muffin')) return '/muffin.png';
    if (name.includes('bun')) return '/bun.png';
    if (name.includes('cookie')) return '/cookie.png';
    if (name.includes('rice')) return '/rice.png';
    if (name.includes('dal')) return '/dal.png';
    if (name.includes('salmon')) return '/salmon.png';
    if (name.includes('chicken')) return '/chicken.png';
    if (name.includes('pomegranate')) return '/pomegranate_juice.png';
    if (name.includes('watermelon')) return '/watermelon_juice.png';
    if (name.includes('mixed fruit')) return '/mixed_juice.png';
    if (name.includes('juice')) return '/juice.png';
    if (name.includes('tea')) return '/tea.png';
    return '/produce.png';
  };

  return (
    <div className="bg-[#ffffff] rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group h-full">
      <div className="relative h-48 bg-transparent flex items-center justify-center p-4">
        {product.season && (
          <span className="absolute top-3 left-3 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-md z-10 border border-green-200">
            {product.season}
          </span>
        )}
        <img 
          src={getProductImage()} 
          alt={product.name} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-gray-600">{product.rating || '4.5'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
            <Leaf className="w-3 h-3" />
            Eco: {product.sustainabilityScore || '8'}/10
          </div>
        </div>
        
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-2 font-medium">By {product.vendor || 'Fresh Local Farms'}</p>
        <p className="text-sm text-gray-500 mb-4">1 {product.unit || 'unit'}</p>
        
        <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">₹{product.price || product.pricePerUnit}</span>
            {product.oldPrice && (
              <span className="text-xs text-gray-400 line-through">₹{product.oldPrice}</span>
            )}
          </div>
          
          {product.inStock === false ? (
            <button 
              disabled
              className="w-full bg-gray-200 text-gray-500 py-2.5 rounded-xl font-bold cursor-not-allowed flex items-center justify-center"
            >
              Out of Stock
            </button>
          ) : (
            <button 
              onClick={handleAddToCart}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium transition-colors duration-300 shadow-sm flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Basket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
