'use client'
import { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, TrendingUp, Package, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₦${stats?.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'from-pink-400 to-pink-600',
      change: '+12.5%',
      isPositive: true
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || '0',
      icon: ShoppingBag,
      color: 'from-purple-400 to-purple-600',
      change: '+8.2%',
      isPositive: true
    },
    {
      title: 'Total Customers',
      value: stats?.totalUsers || '0',
      icon: Users,
      color: 'from-blue-400 to-blue-600',
      change: '+5.3%',
      isPositive: true
    },
    {
      title: 'Active Carts',
      value: stats?.activeCarts || '0',
      icon: Package,
      color: 'from-orange-400 to-orange-600',
      change: '-2.1%',
      isPositive: false
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}
      <div className="backdrop-blur-lg bg-white/70 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-pink-100 text-pink-600 rounded-xl font-medium">
                Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Revenue Chart */}
        <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Revenue Trend (Last 30 Days)</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Growing</span>
            </div>
          </div>
          
          {stats?.revenueTrend && stats.revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fecdd3" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    border: '1px solid #fbcfe8',
                    borderRadius: '12px'
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {stats?.recentOrders?.slice(0, 5).map(order => (
                <div key={order.id} className="bg-white/50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{order.user?.fullName}</p>
                    <p className="text-sm text-gray-600">₦{order.total.toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Selling Products</h2>
            <div className="space-y-3">
              {stats?.topProducts?.map((product, idx) => (
                <div key={product.id} className="bg-white/50 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.totalSold} sold</p>
                  </div>
                  <p className="font-bold text-pink-600">₦{product.price?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}