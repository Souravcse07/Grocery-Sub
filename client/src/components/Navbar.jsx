import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Leaf, User as UserIcon, LogOut, LayoutDashboard, ChevronDown, MapPin, Globe, Settings } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const totalQuantity = useSelector(state => state.cart.totalQuantity);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी', short: 'HI' },
    { code: 'ta', label: 'தமிழ்', short: 'TA' },
    { code: 'te', label: 'తెలుగు', short: 'TE' },
    { code: 'kn', label: 'ಕನ್ನಡ', short: 'KN' },
    { code: 'ml', label: 'മലയാളം', short: 'ML' },
    { code: 'bn', label: 'বাংলা', short: 'BN' },
    { code: 'mr', label: 'मराठी', short: 'MR' }
  ];

  const changeLanguage = (langCode, shortLabel) => {
    setCurrentLang(shortLabel);
    setIsLangDropdownOpen(false);
    
    // Trigger Google Translate manually if script is loaded
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
  };
  const [location, setLocation] = useState({ city: 'Bengaluru', pincode: '562130' });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.error("Error parsing saved location");
      }
    }
  }, []);

  const handleUpdateLocation = () => {
    setIsLoadingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          if (data) {
            const city = data.city || data.locality || data.principalSubdivision || 'Unknown';
            const pincode = data.postcode || '';
            const newLoc = { city, pincode };
            setLocation(newLoc);
            localStorage.setItem('userLocation', JSON.stringify(newLoc));
          }
        } catch (error) {
          console.error("Error fetching location", error);
        } finally {
          setIsLoadingLocation(false);
        }
      }, (error) => {
        console.error("Geolocation error", error);
        setIsLoadingLocation(false);
      }, { timeout: 10000, maximumAge: 0, enableHighAccuracy: true });
    } else {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    // Add Google Translate script
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
      
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi,ta,te,kn,ml,bn,mr',
          autoDisplay: false
        }, 'google_translate_element');
      };
    }

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center cursor-pointer">
            <img src="/logo.png" alt="FreshCart Logo" className="h-12 md:h-14 object-contain" />
          </Link>

          <div className="hidden lg:flex items-center gap-6 mx-4">
            <Link to="/" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Home</Link>
            <Link to="/shop" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Shop</Link>
            <Link to="/subscribe" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Subscribe</Link>
          </div>

          <div 
            className="hidden lg:flex flex-col justify-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200 shrink-0"
            onClick={handleUpdateLocation}
          >
            <span className="text-[11px] text-gray-500 pl-5 leading-tight">
              Delivering to {location.city} {location.pincode}
            </span>
            <div className="flex items-center gap-1 leading-tight mt-0.5">
              <MapPin className="w-4 h-4 text-gray-800" />
              <span className="text-sm font-bold text-gray-800">
                {isLoadingLocation ? 'Updating...' : 'Update location'}
              </span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <input 
                type="text" 
                placeholder="Search for fresh organic groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:bg-[#ffffff] transition-all duration-300 shadow-inner"
              />
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5 cursor-pointer" onClick={handleSearch} />
            </form>
          </div>

          <div className="flex items-center gap-6">
            <div id="google_translate_element" style={{ display: 'none' }}></div>
            
            {/* Language Selector */}
            <div className="relative hidden sm:block" ref={langDropdownRef}>
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span>{currentLang}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 text-xs text-gray-500 font-semibold border-b border-gray-50 mb-1">
                    Change Language
                  </div>
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code, lang.short)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 text-left"
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${currentLang === lang.short ? 'border-orange-500' : 'border-gray-400'}`}>
                        {currentLang === lang.short && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                      </div>
                      <span className="flex-1">{lang.label} - {lang.short}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/cart" className="relative cursor-pointer group block">
              <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-green-600 transition-colors" />
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {totalQuantity}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <div className="relative border-l border-gray-200 pl-6" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                    {(user?.name || user?.username || user?.email || 'A').charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium hidden sm:block">
                    {user?.name || user?.username || user?.email?.split('@')[0] || 'Account Holder'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name || user?.username || user?.email?.split('@')[0] || 'Account Holder'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link 
                      to="/dashboard" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link 
                      to="/settings" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700"
                      >
                        <UserIcon className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-green-600 font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
