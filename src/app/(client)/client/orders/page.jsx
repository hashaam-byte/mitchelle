'use client'
import { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, Download, Sparkles, ShoppingBag, Filter } from 'lucide-react';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const statusColors = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    PAID: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    PREPARING: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

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
              <a href="/client/home" className="text-gray-600 hover:text-pink-600 transition-colors font-medium">
                Home
              </a>
              <a href="/client/cart" className="p-2 hover:bg-pink-50 rounded-lg transition-colors">
                <ShoppingBag className="w-6 h-6 text-gray-700" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Order History 📦</h2>
          <p className="text-gray-600">Track and manage all your orders</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter:</span>
          </div>
          {['ALL', 'PENDING', 'PAID', 'PREPARING', 'DELIVERED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                  : 'bg-white/70 text-gray-700 hover:bg-pink-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-white/50">
                <div className="h-6 bg-pink-200 rounded animate-pulse mb-4 w-1/3"></div>
                <div className="h-4 bg-pink-100 rounded animate-pulse w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl p-12 border border-white/50 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <a
              href="/client/products"
              className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full font-medium hover:from-pink-600 hover:to-pink-700 transition-all"
            >
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const statusStyle = statusColors[order.status];
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="backdrop-blur-lg bg-white/70 rounded-2xl border border-white/50 overflow-hidden hover:shadow-xl transition-all"
                >
                  {/* Order Header */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-2xl font-bold text-gray-800">₦{order.total.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                          {order.status}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Order Date</p>
                        <p className="font-medium text-gray-800">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Items</p>
                        <p className="font-medium text-gray-800">{order.items?.length || 0} item(s)</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Delivery Address</p>
                        <p className="font-medium text-gray-800 line-clamp-1">
                          {order.deliveryAddress || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && order.items && (
                    <div className="border-t border-pink-100 bg-white/30 p-6">
                      <h4 className="font-bold text-gray-800 mb-4">Order Items</h4>
                      <div className="space-y-3 mb-6">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 bg-white/50 rounded-xl p-3">
                            <img
                              src={item.product?.imageUrl || '/placeholder.jpg'}
                              alt={item.product?.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{item.product?.title}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-pink-600">
                              ₦{(item.priceSnapshot * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Order Summary */}
                      <div className="bg-white/50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">₦{order.subtotal.toLocaleString()}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount</span>
                            <span className="font-medium text-green-600">-₦{order.discount.toLocaleString()}</span>
                          </div>
                        )}
                        {order.shipping > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium">₦{order.shipping.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t border-pink-200 pt-2 flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-pink-600">₦{order.total.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {order.status === 'DELIVERED' && (
                        <button className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2">
                          <Download className="w-5 h-5" />
                          Download Receipt
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}