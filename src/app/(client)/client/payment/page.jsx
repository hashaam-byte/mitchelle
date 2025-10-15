'use client'
import { useState, useEffect } from 'react';
import { CheckCircle, Download, Package, ArrowRight, Sparkles, Home } from 'lucide-react';

export default function PaymentSuccess() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const reference = params.get('reference');

        if (reference) {
          const res = await fetch(`/api/orders/verify?reference=${reference}`);
          const data = await res.json();
          
          if (data.order) {
            setOrder(data.order);
          }
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full mb-6 animate-bounce-slow">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Payment Successful! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your order has been confirmed and will be prepared shortly
          </p>
        </div>

        {/* Order Details Card */}
        <div className="backdrop-blur-lg bg-white/70 rounded-3xl border border-white/50 p-8 mb-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-pink-100">
            <Sparkles className="w-8 h-8 text-pink-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
              <p className="text-sm text-gray-600">Order #{order?.id?.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Order Items */}
          {order?.items && order.items.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white/50 rounded-xl p-4">
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
            </div>
          )}

          {/* Payment Breakdown */}
          <div className="bg-white/50 rounded-2xl p-6 space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span className="font-medium">₦{order?.subtotal?.toLocaleString()}</span>
            </div>
            {order?.discount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Discount</span>
                <span className="font-medium text-green-600">-₦{order.discount.toLocaleString()}</span>
              </div>
            )}
            {order?.shipping > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span className="font-medium">₦{order.shipping.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-pink-200 pt-3 flex justify-between font-bold text-xl">
              <span>Total Paid</span>
              <span className="text-pink-600">₦{order?.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Info */}
          {order?.deliveryAddress && (
            <div className="mt-6 bg-pink-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address</p>
              <p className="text-gray-800">{order.deliveryAddress}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <button className="px-6 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-2xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2 group">
            <Download className="w-5 h-5" />
            Download Receipt
          </button>
          
          <a
            href="/client/orders"
            className="px-6 py-4 bg-white/70 backdrop-blur-lg text-gray-800 rounded-2xl font-medium hover:bg-white transition-all border border-pink-200 flex items-center justify-center gap-2 group"
          >
            <Package className="w-5 h-5" />
            View Orders
          </a>
          
          <a
            href="/client/products"
            className="px-6 py-4 bg-white/70 backdrop-blur-lg text-gray-800 rounded-2xl font-medium hover:bg-white transition-all border border-pink-200 flex items-center justify-center gap-2 group"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <a
            href="/client/home"
            className="inline-flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </a>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}