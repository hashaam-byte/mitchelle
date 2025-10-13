'use client'
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, Sparkles, ArrowRight, Star, Gift, Clock, Shield, TrendingUp, Eye } from 'lucide-react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeAd, setActiveAd] = useState(null);
  const [adTracked, setAdTracked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?featured=true&limit=4');
        const data = await res.json();
        setFeaturedProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch active ad
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch('/api/ads/impression');
        const data = await res.json();
        if (data.ads && data.ads.length > 0) {
          setActiveAd(data.ads[0]);
        }
      } catch (error) {
        console.error('Failed to fetch ad:', error);
      }
    };

    fetchAd();
  }, []);

  // Track ad impression (once per session)
  useEffect(() => {
    if (activeAd && !adTracked) {
      const trackImpression = async () => {
        try {
          await fetch('/api/ads/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adId: activeAd.id }),
          });
          setAdTracked(true);
        } catch (error) {
          console.error('Failed to track ad:', error);
        }
      };

      const timer = setTimeout(trackImpression, 2000);
      return () => clearTimeout(timer);
    }
  }, [activeAd, adTracked]);

  const features = [
    { icon: Clock, title: "Quick Delivery", desc: "Same day delivery available" },
    { icon: Shield, title: "Quality Assured", desc: "Premium ingredients only" },
    { icon: Gift, title: "Custom Orders", desc: "Personalized to perfection" },
    { icon: Star, title: "Top Rated", desc: "5-star customer reviews" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
              <Sparkles className="w-8 h-8 text-pink-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                MsCakeHub
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">Home</a>
              <a href="/client/products" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">Shop</a>
              <a href="#about" className="text-gray-700 hover:text-pink-600 transition-colors font-medium">About</a>
              <button 
                onClick={() => window.location.href = '/client/cart'}
                className="p-2 hover:bg-pink-50 rounded-lg transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5 text-gray-700" />
              </button>
              <button 
                onClick={() => window.location.href = '/auth/login'}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-500/30"
              >
                Sign In
              </button>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200">
            <div className="px-4 py-6 space-y-4">
              <a href="#home" className="block text-gray-700 hover:text-pink-600 transition-colors font-medium">Home</a>
              <a href="/client/products" className="block text-gray-700 hover:text-pink-600 transition-colors font-medium">Shop</a>
              <a href="#about" className="block text-gray-700 hover:text-pink-600 transition-colors font-medium">About</a>
              <button 
                onClick={() => window.location.href = '/auth/login'}
                className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 rounded-full">
                <TrendingUp className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-medium text-pink-700">Trending Now</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                  Sweet Moments
                </span>
                <br />
                <span className="text-gray-800">Made Perfect</span>
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                Indulge in handcrafted cakes, cookies, and pastries made with love. 
                Order now and taste the difference quality makes.
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => window.location.href = '/client/products'}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-500/30 flex items-center gap-2 group"
                >
                  Start Shopping
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => window.location.href = '/client/products'}
                  className="px-8 py-4 bg-white text-gray-800 rounded-full font-medium hover:bg-gray-50 transition-all shadow-lg border border-gray-200"
                >
                  View Menu
                </button>
              </div>
            </div>

            <div className="relative">
              {loading ? (
                <div className="backdrop-blur-lg bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/50">
                  <div className="aspect-square bg-gradient-to-br from-pink-200 to-pink-400 rounded-2xl animate-pulse"></div>
                </div>
              ) : featuredProducts[0] ? (
                <div className="backdrop-blur-lg bg-white/60 rounded-3xl p-8 shadow-2xl border border-white/50">
                  <img 
                    src={featuredProducts[0].imageUrl} 
                    alt={featuredProducts[0].title}
                    className="aspect-square object-cover rounded-2xl"
                  />
                  <div className="mt-6 space-y-3">
                    <h3 className="text-2xl font-bold text-gray-800">{featuredProducts[0].title}</h3>
                    <p className="text-gray-600">{featuredProducts[0].description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-pink-600">₦{featuredProducts[0].price.toLocaleString()}</span>
                      <button 
                        onClick={() => window.location.href = `/client/product/${featuredProducts[0].id}`}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-500/20"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      {activeAd && (
        <div className="fixed bottom-4 right-4 z-40 max-w-xs">
          <div className="backdrop-blur-lg bg-gradient-to-r from-pink-500/90 to-pink-600/90 rounded-2xl p-4 shadow-2xl border border-white/30 flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{activeAd.title}</p>
              <p className="text-white/80 text-xs">Limited time offer</p>
            </div>
            <button 
              onClick={() => setActiveAd(null)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 border border-white/50 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-pink-600 to-pink-700 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8" />
            <span className="text-3xl font-bold">MsCakeHub</span>
          </div>
          <p className="text-pink-100 mb-6">Making every celebration sweeter since 2024</p>
          <p className="text-pink-200 text-sm">© 2025 MsCakeHub. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}