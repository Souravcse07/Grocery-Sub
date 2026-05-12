import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import axiosInstance from '../api/axiosInstance';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/products');
        setProducts(response.data.products || response.data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);



  const groceriesAndFood = [
    { name: 'Atta, rice & grains', image: '/categories/atta_rice_w.png' },
    { name: 'Dals & pulses', image: '/categories/dals_pulses_w.png' },
    { name: 'Oil & ghee', image: '/categories/oil_ghee_w.png' },
    { name: 'Masala, sugar & spices', image: '/categories/masala_spices_w.png' },
    { name: 'Cereals & breakfast', image: '/categories/cereals_breakfast_w.png' },
    { name: 'Tea, coffee & drink mixes', image: '/tea.png' },
    { name: 'Juices & cold drinks', image: '/mixed_juice.png' },
    { name: 'Sauces & spreads', image: '/butter.png' },
    { name: 'Noodles & pasta', image: '/produce.png' },
    { name: 'Chips & biscuits', image: '/cookie.png' },
    { name: 'Chocolates & sweets', image: '/muffin.png' },
    { name: 'Indian snacks', image: '/bun.png' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <Hero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {/* Exclusive Offers Section */}
        <div id="offers" className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Exclusive Offers</h2>
              <p className="text-gray-500 mt-2">Save more with our special discounts.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white opacity-10 rounded-full"></div>
              <h3 className="text-2xl font-bold mb-2">Flat ₹199 OFF</h3>
              <p className="text-green-50 text-lg mb-4">On all orders above ₹800.</p>
              <div className="mt-auto">
                <span className="inline-block bg-white text-green-700 px-4 py-2 rounded-full font-bold text-sm tracking-wide shadow-sm">AUTO APPLIED</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white flex flex-col justify-center relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white opacity-10 rounded-full"></div>
              <h3 className="text-2xl font-bold mb-2">10% OFF with Credit Card</h3>
              <p className="text-blue-50 text-lg mb-4">Pay securely using your Credit Card.</p>
              <div className="mt-auto">
                <span className="inline-block bg-white text-blue-700 px-4 py-2 rounded-full font-bold text-sm tracking-wide shadow-sm">SELECT AT CHECKOUT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Groceries & food</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10">
            {groceriesAndFood.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate(`/shop?category=${encodeURIComponent(item.name)}`)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-4 relative transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-lg">
                  <img src={item.image} alt={item.name} className="w-28 h-28 object-contain absolute z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-center font-medium text-gray-800 text-sm leading-tight max-w-[120px] group-hover:text-green-700 transition-colors">
                  {item.name.split(' & ').map((part, i, arr) => (
                    <span key={i}>
                      {part}{i < arr.length - 1 ? ' & ' : ''}<br/>
                    </span>
                  ))}
                </h3>
              </div>
            ))}
          </div>
        </div>



        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 mt-2">Handpicked fresh items for your daily needs.</p>
          </div>
          <button onClick={() => navigate('/shop')} className="text-green-600 font-semibold hover:text-green-700">View All →</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <p className="text-gray-500 col-span-full text-center py-10">Loading fresh products...</p>
          ) : products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-10">No products found for this category.</p>
          )}
        </div>
      </main>
    </div>
  );
}
