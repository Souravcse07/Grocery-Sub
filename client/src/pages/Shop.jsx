import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useGetProductsQuery } from '../features/api/apiSlice';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';

  const [filters, setFilters] = useState({
    category: categoryParam,
    season: '',
    inStock: false,
    page: 1,
    limit: 12,
    q: qParam
  });

  // Sync q and category params if they change
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || filters.category; // fallback to current filter if not in url
    setFilters(prev => ({ ...prev, q: query, category: searchParams.has('category') ? category : prev.category, page: 1 }));
  }, [searchParams]);

  const [allProducts, setAllProducts] = useState([]);
  const { data, isLoading, isFetching } = useGetProductsQuery(filters);

  // Append new products on page change
  useEffect(() => {
    if (data?.products) {
      if (filters.page === 1) {
        setAllProducts(data.products);
      } else {
        setAllProducts(prev => [...prev, ...data.products]);
      }
    } else if (data && Array.isArray(data)) {
      if (filters.page === 1) {
        setAllProducts(data);
      } else {
        setAllProducts(prev => [...prev, ...data]);
      }
    }
  }, [data, filters.page]);

  // Infinite Scroll setup
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (isFetching) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && data && (data.totalPages ? filters.page < data.totalPages : data.length === filters.limit)) {
        setFilters(prev => ({ ...prev, page: prev.page + 1 }));
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isFetching, data, filters.page, filters.limit]);

  const categories = [
    'All', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Meat', 'Drinks',
    'Atta, rice & grains', 'Dals & pulses', 'Oil & ghee', 'Masala, sugar & spices', 
    'Cereals & breakfast', 'Tea, coffee & drink mixes', 'Juices & cold drinks', 
    'Sauces & spreads', 'Noodles & pasta', 'Chips & biscuits', 'Chocolates & sweets', 'Indian snacks'
  ];
  const seasons = ['', 'Spring', 'Summer', 'Autumn', 'Winter'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'All',
      season: '',
      inStock: false,
      page: 1,
      limit: 12,
      q: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="bg-green-800 text-white py-12 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-7xl mx-auto flex flex-col relative items-center">
          <button 
            onClick={() => navigate(-1)}
            className="absolute left-0 top-0 flex items-center gap-2 text-green-100 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          
          <h1 className="text-4xl font-bold mb-4">
            {filters.q ? `Search Results for "${filters.q}"` : (filters.category !== 'All' ? filters.category : 'Shop Fresh Groceries')}
          </h1>
          <p className="text-green-100 max-w-2xl mx-auto">
            {filters.q ? 'Showing the freshest matches for your search.' : 'Discover organic, sustainable, and fresh produce sourced locally.'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8">
        {/* Product Grid */}
        <main className="flex-1">
          {isLoading && filters.page === 1 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
            </div>
          ) : allProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allProducts.map((product, index) => {
                  if (allProducts.length === index + 1) {
                    return <div ref={lastElementRef} key={product._id || product.id}><ProductCard product={product} /></div>
                  } else {
                    return <ProductCard key={product._id || product.id} product={product} />
                  }
                })}
              </div>
              {isFetching && filters.page > 1 && (
                <div className="text-center py-6 text-gray-500">Loading more...</div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              <button onClick={clearFilters} className="mt-4 text-green-600 font-medium hover:underline">Clear all filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
