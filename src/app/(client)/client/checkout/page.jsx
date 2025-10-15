'use client'
import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, CreditCard, MapPin, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [discount, setDiscount] = useState(0);

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
      if (data.cartItems?.length === 0) {
        window.location.href = '/client/cart';
        return;
      }
      
      setCartItems(data.cartItems || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const applyDiscount = async () => {
    if (!discountCode) return;
    
    setApplyingDiscount(true);
    setError('');
    
    try {
      const response = await fetch('/api/discounts/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, subtotal: total }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setDiscount(data.discount || 0);
        alert('Discount applied successfully!');
      } else {
        setError(data.error || 'Invalid discount code');
      }
    } catch (error) {
      setError('Failed to apply discount');
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryAddress,
          discountCode: discount > 0 ? discountCode : undefined,
        }),
      });

      if (!orderResponse.ok) {
        const orderData = await orderResponse.json();
        throw new Error(orderData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.order.id;

      const paymentResponse = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (!paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        throw new Error(paymentData.error || 'Failed to initialize payment');
      }

      const paymentData = await paymentResponse.json();
      
      if (paymentData.authorizationUrl) {
        window.location.href = paymentData.authorizationUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || 'Checkout failed. Please try again.');
      setProcessing(false);
    }
  };

  const finalTotal = total - discount;
  const platformFee = (finalTotal * 0.05).toFixed(2);
  const grandTotal = (parseFloat(finalTotal) + parseFloat(platformFee)).toFixed(2);

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
              onClick={() => window.location.href = '/client/cart'}
              className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Cart</span>
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-pink-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-700 bg-clip-text text-transparent">
                MsCakeHub
              </span>
            </div>

            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-pink-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Delivery Address</h2>
              </div>
              
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all resize-none"
                required
              />
            </div>

            {/* Discount Code */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Discount Code</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                />
                <button
                  onClick={applyDiscount}
                  disabled={applyingDiscount || !discountCode}
                  className="px-6 py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applyingDiscount ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {discount > 0 && (
                <div className="mt-3 text-sm text-green-600 font-medium">
                  ✓ Discount of ₦{discount.toFixed(2)} applied
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-pink-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200">
                <img 
                  src="https://paystack.com/assets/logo/logo-mark.png" 
                  alt="Paystack" 
                  className="w-12 h-12"
                />
                <div>
                  <p className="font-medium text-gray-800">Pay with Paystack</p>
                  <p className="text-sm text-gray-600">Secure payment via Paystack</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-pink-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <img
                      src={item.product?.imageUrl || '/placeholder-cake.png'}
                      alt={item.product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-sm truncate">
                        {item.product?.name || 'Product'}
                      </h3>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-pink-600">
                        ₦{((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-medium">₦{total.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₦{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Platform Fee (5%)</span>
                  <span className="font-medium">₦{platformFee}</span>
                </div>

                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span className="text-pink-600">₦{grandTotal}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={processing || !deliveryAddress.trim()}
                className="w-full mt-6 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-pink-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Proceed to Payment
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}