// components/super-admin/SuperAdminLayoutUI.tsx
'use client'
import { useState, useEffect } from 'react';
import { Crown, Shield, Users, UserCog, Database, Settings, Activity, TrendingUp, Lock, Key, FileText, Globe, AlertTriangle, LogOut, Menu, X, Sparkles, Bell, Eye, Zap } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

export default function SuperAdminLayoutUI({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalAdmins: 0, 
    systemHealth: 100,
    activeUsers: 0 
  });
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Fetch super admin stats
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/super-admin/dashboard');

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalUsers: statsData.totalUsers || 0,
            totalAdmins: statsData.totalAdmins || 0,
            systemHealth: statsData.systemHealth || 100,
            activeUsers: statsData.activeUsers || 0
          });
          setNotifications(statsData.pendingActions || 0);
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
    { name: 'Overview', href: '/super-admin/overview', icon: Eye, badge: null },
    { name: 'System Health', href: '/super-admin/system', icon: Activity, badge: null },
    { name: 'User Management', href: '/super-admin/users', icon: Users, badge: null },
    { name: 'Admin Management', href: '/super-admin/admins', icon: UserCog, badge: notifications },
    { name: 'Role & Permissions', href: '/super-admin/permissions', icon: Shield, badge: null },
    { name: 'Database', href: '/super-admin/database', icon: Database, badge: null },
    { name: 'Security Logs', href: '/super-admin/security', icon: Lock, badge: null },
    { name: 'API Keys', href: '/super-admin/api-keys', icon: Key, badge: null },
    { name: 'Audit Logs', href: '/super-admin/audit', icon: FileText, badge: null },
    { name: 'Site Settings', href: '/super-admin/settings', icon: Settings, badge: null },
    { name: 'Analytics', href: '/super-admin/analytics', icon: TrendingUp, badge: null },
  ];

  const handleNavigation = (href) => {
    router.push(href);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background - Dark Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-grid-white/[0.02] pointer-events-none"></div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-80 lg:flex-col z-50">
        <div className="flex flex-col flex-grow overflow-y-auto backdrop-blur-2xl bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 border-r border-purple-500/20 shadow-2xl shadow-purple-500/10">
          {/* Logo Section with Crown */}
          <div className="relative px-6 py-6 border-b border-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-gradient"></div>
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-70 animate-pulse"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Crown className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                  MsCakeHub
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 text-xs font-black rounded-lg flex items-center gap-1 shadow-lg">
                    <Zap className="w-3 h-3" />
                    SUPER ADMIN
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="px-6 py-4 border-b border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-md opacity-50"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-slate-900 font-bold ring-2 ring-yellow-400/30">
                    {user.name?.charAt(0) || user.email?.charAt(0) || 'S'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name || 'Super Admin'}</p>
                  <p className="text-xs text-purple-300 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {!loading && (
            <div className="px-4 py-4 grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-3 border border-cyan-400/30 shadow-lg shadow-cyan-500/10">
                <Users className="w-5 h-5 mb-2 text-cyan-400" />
                <p className="text-xs text-cyan-300">Total Users</p>
                <p className="text-lg font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-3 border border-purple-400/30 shadow-lg shadow-purple-500/10">
                <Shield className="w-5 h-5 mb-2 text-purple-400" />
                <p className="text-xs text-purple-300">Admins</p>
                <p className="text-lg font-bold text-white">{stats.totalAdmins}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-3 border border-green-400/30 shadow-lg shadow-green-500/10">
                <Activity className="w-5 h-5 mb-2 text-green-400" />
                <p className="text-xs text-green-300">System Health</p>
                <p className="text-lg font-bold text-white">{stats.systemHealth}%</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-sm rounded-xl p-3 border border-orange-400/30 shadow-lg shadow-orange-500/10">
                <Zap className="w-5 h-5 mb-2 text-orange-400" />
                <p className="text-xs text-orange-300">Active Now</p>
                <p className="text-lg font-bold text-white">{stats.activeUsers}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-purple-500/40 text-white shadow-xl shadow-purple-500/20 scale-[1.02] border border-purple-400/30'
                      : 'text-gray-300 hover:bg-white/5 hover:shadow-lg hover:scale-[1.02] hover:text-white border border-transparent'
                  }`}
                >
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-r-full"></div>
                    </>
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-purple-300' : 'text-gray-400 group-hover:text-purple-400'}`} />
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

          {/* Security Alert */}
          <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-red-400/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="font-bold text-white">Security Notice</span>
              </div>
              <p className="text-sm text-red-200 mb-3">All actions are logged and monitored</p>
              <div className="flex items-center gap-2 text-xs text-red-300">
                <Lock className="w-3 h-3" />
                <span>High-level access enabled</span>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-purple-500/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-red-500/30"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-slate-900/95 border-b border-purple-500/20 shadow-xl">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                MsCakeHub
              </h1>
              <p className="text-xs text-purple-300">Super Admin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 hover:bg-purple-500/10 rounded-xl transition-all">
              <Bell className="w-6 h-6 text-purple-300" />
              {notifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-purple-500/10 rounded-xl transition-all"
            >
              {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] backdrop-blur-2xl bg-gradient-to-br from-slate-900/98 via-purple-900/95 to-slate-900/98 shadow-2xl overflow-y-auto border-r border-purple-500/20">
            <div className="flex flex-col h-full">
              {/* Mobile Logo */}
              <div className="relative px-6 py-6 border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                        MsCakeHub
                      </h1>
                      <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 text-xs font-black rounded-md flex items-center gap-1 w-fit mt-1">
                        <Zap className="w-3 h-3" />
                        SUPER ADMIN
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 hover:bg-purple-500/10 rounded-xl transition-all"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Mobile User Info */}
              {user && (
                <div className="px-6 py-4 border-b border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-slate-900 font-bold ring-2 ring-yellow-400/30">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name || 'Super Admin'}</p>
                      <p className="text-xs text-purple-300 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Stats */}
              {!loading && (
                <div className="px-4 py-4 grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-3 border border-cyan-400/30">
                    <Users className="w-5 h-5 mb-2 text-cyan-400" />
                    <p className="text-xs text-cyan-300">Users</p>
                    <p className="text-lg font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-3 border border-purple-400/30">
                    <Shield className="w-5 h-5 mb-2 text-purple-400" />
                    <p className="text-xs text-purple-300">Admins</p>
                    <p className="text-lg font-bold text-white">{stats.totalAdmins}</p>
                  </div>
                </div>
              )}

              {/* Mobile Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href);
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-purple-500/40 text-white shadow-xl shadow-purple-500/20 border border-purple-400/30'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
                      )}
                      <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-purple-300' : 'text-gray-400'}`} />
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

              {/* Mobile Security Alert */}
              <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-red-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-white">Security Notice</span>
                </div>
                <p className="text-sm text-red-200 mb-3">All actions are logged</p>
                <div className="flex items-center gap-2 text-xs text-red-300">
                  <Lock className="w-3 h-3" />
                  <span>High-level access</span>
                </div>
              </div>

              {/* Mobile Logout */}
              <div className="p-4 border-t border-purple-500/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3.5 text-red-400 hover:bg-red-500/10 rounded-2xl font-medium transition-all duration-300 border border-transparent hover:border-red-500/30"
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

      <style>{`
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

        .bg-grid-white\/\[0\.02\] {
          background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .bg-grid-white\/5 {
          background-image: linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}