'use client'
import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.status === 401) {
        window.location.href = '/auth/login';
        return;
      }
      
      const data = await response.json();
      setCartItems(data.cartItems || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(cartItemId);
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      });

      if (response.ok) {
        await fetchCart();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (cartItemId) => {
    if (!confirm('Remove this item from cart?')) return;

    setUpdating(cartItemId);
    try {
      const response = await fetch(`/api/cart?id=${cartItemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCart();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => window.location.href = '/client/products'}
              className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Continue Shopping</span>
            </button>

            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
              <Sparkles className="w-8 h-8 text-pink-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                MsCakeHub
              </span>
            </div>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some delicious treats to get started!</p>
            <button
              onClick={() => window.location.href = '/client/products'}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-500/30"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-6">
                    <div 
                      className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => window.location.href = `/client/product/${item.product.id}`}
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 
                        className="font-bold text-gray-800 mb-1 cursor-pointer hover:text-pink-600 transition-colors"
                        onClick={() => window.location.href = `/client/product/${item.product.id}`}
                      >
                        {item.product.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{item.product.category}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updating === item.id || item.quantity <= 1}
                              className="px-3 py-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id || item.quantity >= item.product.stock}
                              className="px-3 py-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating === item.id}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-pink-600">
                            ₦{(item.product.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₦{item.product.price.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-medium">₦{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-pink-600">₦{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => window.location.href = '/client/checkout'}
                  className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="mt-6 p-4 bg-pink-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Free Delivery</p>
                      <p className="text-gray-600">On all orders within Lagos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}