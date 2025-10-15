// app/(admin)/admin/layout.tsx - FIXED VERSION
'use client'
import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, ShoppingBag, DollarSign, Gift, Crown, LogOut, Menu, X, Sparkles, TrendingUp, Bell, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('');
  const [userRole, setUserRole] = useState('ADMIN');
  const [notifications, setNotifications] = useState(0);
  const [stats, setStats] = useState({ revenue: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveRoute(window.location.pathname);
    
    // Fetch user role and stats
    const fetchData = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/admin/dashboard')
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserRole(userData.user.role);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            revenue: statsData.totalRevenue || 0,
            orders: statsData.totalOrders || 0
          });
          setNotifications(statsData.todayOrders || 0);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
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
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, badge: null, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Products', href: '/admin/products', icon: Package, badge: null, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Users', href: '/admin/users', icon: Users, badge: null, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, badge: notifications, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Payments', href: '/admin/payments', icon: DollarSign, badge: null, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Discounts', href: '/admin/discounts', icon: Gift, badge: null, roles: ['ADMIN', 'SUPER_ADMIN'] },
    { name: 'Owner Dashboard', href: '/admin/owner', icon: Crown, badge: null, roles: ['SUPER_ADMIN'], special: true },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  const handleNavigation = (href: string) => {
    window.location.href = href;
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-pink-200 to-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col z-50">
        <div className="flex flex-col flex-grow overflow-y-auto backdrop-blur-2xl bg-gradient-to-br from-white/90 via-pink-50/70 to-purple-50/70 border-r border-white/50 shadow-2xl">
          {/* Logo Section */}
          <div className="relative px-6 py-6 border-b border-white/40 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 animate-gradient"></div>
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-pink-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MsCakeHub
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-semibold text-gray-600">Admin Portal</span>
                  {userRole === 'SUPER_ADMIN' && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Owner
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {!loading && (
            <div className="px-4 py-4 grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
                <TrendingUp className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-xs opacity-90">Revenue</p>
                <p className="text-lg font-bold">₦{(stats.revenue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
                <ShoppingBag className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-xs opacity-90">Orders</p>
                <p className="text-lg font-bold">{stats.orders.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1.5">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.href || activeRoute.startsWith(item.href);
              
              if (item.special) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full group relative flex items-center gap-4 px-4 py-4 rounded-2xl font-medium transition-all duration-300 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 mt-4"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-pink-400 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                    <Icon className="w-6 h-6 relative z-10" />
                    <span className="relative z-10 font-bold">{item.name}</span>
                    <Crown className="w-5 h-5 ml-auto relative z-10 animate-pulse" />
                  </button>
                );
              }
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-pink-600 text-white shadow-xl shadow-pink-500/30 scale-[1.02]'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-white/80 hover:to-pink-50/80 hover:shadow-lg hover:scale-[1.02]'
                  }`}
                >
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                    </>
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-pink-600'}`} />
                  <span className="relative z-10 flex-1 text-left">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="relative z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-white/40">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-gradient-to-r from-white/90 via-pink-50/70 to-purple-50/70 border-b border-white/50 shadow-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-pink-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                MsCakeHub
              </h1>
              <p className="text-xs text-gray-600">Admin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 hover:bg-pink-50 rounded-xl transition-all">
              <Bell className="w-6 h-6 text-gray-700" />
              {notifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-pink-50 rounded-xl transition-all"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar - Same as desktop but in overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] backdrop-blur-2xl bg-gradient-to-br from-white/95 via-pink-50/90 to-purple-50/90 shadow-2xl overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Mobile Logo */}
              <div className="relative px-6 py-6 border-b border-white/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        MsCakeHub
                      </h1>
                      {userRole === 'SUPER_ADMIN' && (
                        <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1 w-fit mt-1">
                          <Crown className="w-3 h-3" />
                          Owner
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-pink-50 rounded-xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Mobile Stats */}
              {!loading && (
                <div className="px-4 py-4 grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
                    <TrendingUp className="w-5 h-5 mb-2 opacity-80" />
                    <p className="text-xs opacity-90">Revenue</p>
                    <p className="text-lg font-bold">₦{(stats.revenue / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
                    <ShoppingBag className="w-5 h-5 mb-2 opacity-80" />
                    <p className="text-xs opacity-90">Orders</p>
                    <p className="text-lg font-bold">{stats.orders.toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Mobile Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-1.5">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeRoute === item.href || activeRoute.startsWith(item.href);
                  
                  if (item.special) {
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigation(item.href)}
                        className="w-full group relative flex items-center gap-4 px-4 py-4 rounded-2xl font-medium transition-all duration-300 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 mt-4"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-pink-400 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                        <Icon className="w-6 h-6 relative z-10" />
                        <span className="relative z-10 font-bold">{item.name}</span>
                        <Crown className="w-5 h-5 ml-auto relative z-10 animate-pulse" />
                      </button>
                    );
                  }
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 via-purple-600 to-pink-600 text-white shadow-xl shadow-pink-500/30 scale-[1.02]'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-white/80 hover:to-pink-50/80 hover:shadow-lg hover:scale-[1.02]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl blur-xl opacity-40 animate-pulse"></div>
                      )}
                      <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-pink-600'}`} />
                      <span className="relative z-10 flex-1 text-left">{item.name}</span>
                      {item.badge && item.badge > 0 && (
                        <span className="relative z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Logout */}
              <div className="p-4 border-t border-white/40">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-80">
        <div className="min-h-screen pt-20 lg:pt-0">
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}