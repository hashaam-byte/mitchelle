'use client'
import { useState, useEffect } from 'react';
import { Home, ShoppingBag, Package, User, ShoppingCart, LogOut, Menu, X, Sparkles, Gift, Star, Bell } from 'lucide-react';

export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('');
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    setActiveRoute(window.location.pathname);
    
    // Auto-close sidebar on desktop
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { name: 'Home', href: '/client/home', icon: Home, badge: null },
    { name: 'Products', href: '/client/products', icon: ShoppingBag, badge: null },
    { name: 'Cart', href: '/client/cart', icon: ShoppingCart, badge: notifications },
    { name: 'Orders', href: '/client/orders', icon: Package, badge: null },
    { name: 'Profile', href: '/client/profile', icon: User, badge: null },
  ];

  const handleNavigation = (href) => {
    window.location.href = href;
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    // Add logout logic here
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-pink-200 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-gradient-to-r from-rose-200 to-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-50">
        <div className="flex flex-col flex-grow overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-white/80 via-pink-50/60 to-purple-50/60 border-r border-white/40 shadow-2xl">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/30">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 animate-pulse-slow">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MsCakeHub
              </h1>
              <p className="text-xs text-gray-600">Client Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.href || activeRoute.startsWith(item.href);
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/40 scale-105'
                      : 'text-gray-700 hover:bg-white/60 hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-pink-600'}`} />
                  <span className="relative z-10">{item.name}</span>
                  {item.badge && (
                    <span className="relative z-10 ml-auto bg-white text-pink-600 text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {!isActive && (
                    <div className="absolute right-4 w-2 h-2 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Special Offers Section */}
          <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-2xl text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                <span className="font-bold">Special Offer!</span>
              </div>
              <p className="text-sm text-white/90 mb-3">Get 20% off on your next order</p>
              <button className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-2 rounded-xl transition-all duration-300 hover:scale-105">
                Claim Now
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl font-medium transition-all duration-300 hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-gradient-to-r from-white/80 via-pink-50/60 to-purple-50/60 border-b border-white/40 shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              MsCakeHub
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-pink-50 rounded-xl transition-all">
              <Bell className="w-6 h-6 text-gray-700" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-pink-50 rounded-xl transition-all"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          sidebarOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar Panel */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] backdrop-blur-xl bg-gradient-to-br from-white/95 via-pink-50/80 to-purple-50/80 shadow-2xl transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Logo */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    MsCakeHub
                  </h1>
                  <p className="text-xs text-gray-600">Client Portal</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-pink-50 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.href || activeRoute.startsWith(item.href);
                
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={`w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/40'
                        : 'text-gray-700 hover:bg-white/60 hover:shadow-lg'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto bg-white text-pink-600 text-xs font-bold px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Special Offers */}
            <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-2xl text-white">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                <span className="font-bold">Special Offer!</span>
              </div>
              <p className="text-sm text-white/90 mb-3">Get 20% off on your next order</p>
              <button className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-2 rounded-xl transition-all">
                Claim Now
              </button>
            </div>

            {/* Mobile Logout */}
            <div className="p-4 border-t border-white/30">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl font-medium transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-72 pt-20 lg:pt-0 relative z-10">
        {children}
      </main>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .bg-grid-white\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.1;
        }
      `}</style>
    </div>
  );
}