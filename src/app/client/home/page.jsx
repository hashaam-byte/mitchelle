'use client'
import { useState, useEffect } from 'react';
import { ShoppingBag, Clock, Gift, TrendingUp, Package, ArrowRight, Sparkles, Star } from 'lucide-react';

export default function ClientHome() {
  const [user, setUser] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch('/api/products?featured=true&limit=6'),
          fetch('/api/orders')
        ]);

        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        setFeaturedProducts(productsData.products || []);
        setRecentOrders(ordersData.orders?.slice(0, 3) || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const quickActions = [
    { icon: ShoppingBag, label: 'Browse Products', href: '/client/products', color: 'from-pink-400 to-pink-600' },
    { icon: Package, label: 'My Orders', href: '/client/orders', color: 'from-purple-400 to-purple-600' },
    { icon: Gift, label: 'Special Offers', href: '/client/products?featured=true', color: 'from-rose-400 to-rose-600' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-lg bg-white/70 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                MsCakeHub
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <a href="/client/cart" className="p-2 hover:bg-pink-50 rounded-lg transition-colors">
                <ShoppingBag className="w-6 h-6 text-gray-700" />
              </a>
              <a href="/client/profile" className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full text-sm font-medium">
                Profile
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back! 🎉</h2>
          <p className="text-gray-600">Discover delicious treats and sweet moments</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <a
                key={idx}
                href={action.href}
                className="group backdrop-blur-lg bg-white/70 rounded-2xl p-6 border border-white/50 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{action.label}</h3>
                <div className="flex items-center text-pink-600 text-sm font-medium">
                  Go <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Featured Treats ✨</h3>
            <a href="/client/products" className="text-pink-600 font-medium hover:text-pink-700 transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="backdrop-blur-lg bg-white/60 rounded-2xl p-4 border border-white/50">
                  <div className="aspect-square bg-gradient-to-br from-pink-200 to-pink-400 rounded-xl animate-pulse mb-4"></div>
                  <div className="h-4 bg-pink-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-pink-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.map(product => (
                <a
                  key={product.id}
                  href={`/client/product/${product.id}`}
                  className="group backdrop-blur-lg bg-white/60 rounded-2xl p-4 border border-white/50 hover:shadow-xl transition-all"
                >
                  <div className="aspect-square overflow-hidden rounded-xl mb-4">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">{product.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-pink-600">₦{product.price.toLocaleString()}</span>
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Recent Orders 📦</h3>
              <a href="/client/orders" className="text-pink-600 font-medium hover:text-pink-700 transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-4">
              {recentOrders.map(order => (
                <div key={order.id} className="backdrop-blur-lg bg-white/70 rounded-2xl p-6 border border-white/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-lg font-bold text-gray-800">₦{order.total.toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}