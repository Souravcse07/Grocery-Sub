import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl mx-4 mt-6 sm:mx-8 shadow-sm border border-white/50">
      {/* Background pattern */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10"></div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="md:w-1/2 space-y-6 z-10">
          <span className="inline-block py-1.5 px-4 rounded-full bg-green-200/50 text-green-700 text-sm font-semibold tracking-wider border border-green-300 shadow-sm backdrop-blur-sm">
            🌱 100% ORGANIC & FRESH
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            Bring <span className="text-green-600 drop-shadow-sm">Nature's</span> Best <br />To Your Doorstep
          </h1>
          <p className="text-lg text-gray-600 max-w-lg leading-relaxed font-medium">
            Shop the freshest produce, dairy, and everyday essentials. Delivered lightning fast with unmatched reliability.
          </p>
          <div className="flex items-center gap-4 pt-6">
            <button
              onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-green-600/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
            >
              Shop Now <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-full font-bold shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg"
            >
              View Offers
            </button>
          </div>
        </div>

        <div className="md:w-1/2 relative z-10 flex justify-center">
          <div className="absolute inset-0 bg-green-300 blur-3xl opacity-40 rounded-full w-full h-full m-auto"></div>
          <img
            src="/hero.png"
            alt="Fresh Groceries"
            className="relative z-10 w-full max-w-xl object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 scale-110"
          />
        </div>
      </div>
    </div>
  );
}
