import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    fullName: user?.name || '',
    street: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'OR',
    zipCode: '97477',
    country: 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No items to checkout</h2>
        <p className="text-gray-500 mb-6 text-sm">Please add products to your cart before proceeding.</p>
        <Link to="/products" className="px-6 py-3 bg-retail-accent text-white font-semibold rounded-xl text-sm">
          Browse Products
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    const fullAddress = `${shipping.fullName}, ${shipping.street}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}, ${shipping.country}`;

    try {
      setSubmitting(true);
      const res = await api.post('/orders/checkout', {
        shippingAddress: fullAddress,
        paymentMethod,
      });

      const placedOrder = res.data.data;
      await clearCart();
      navigate(`/order-success/${placedOrder.id}`, { state: { order: placedOrder } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete your order with encrypted zero-downtime processing
        </p>
      </div>

      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="text-amber-600" size={20} />
            <div>
              <p className="text-sm font-bold text-amber-900">Sign in to complete checkout</p>
              <p className="text-xs text-amber-700">You need an active RetailMax account to track orders and save your invoice.</p>
            </div>
          </div>
          <Link
            to="/login"
            state={{ from: { pathname: '/checkout' } }}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Sign In Now
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Shipping & Payment Fields */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-3">
              <Truck size={20} className="text-retail-accent" />
              <h2>1. Shipping Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={shipping.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent focus:ring-1 focus:ring-retail-accent outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={shipping.street}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent focus:ring-1 focus:ring-retail-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={shipping.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent focus:ring-1 focus:ring-retail-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">State / Province</label>
                <input
                  type="text"
                  name="state"
                  value={shipping.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent focus:ring-1 focus:ring-retail-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={shipping.zipCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent focus:ring-1 focus:ring-retail-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={shipping.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent focus:ring-1 focus:ring-retail-accent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg border-b border-gray-100 pb-3">
              <CreditCard size={20} className="text-retail-accent" />
              <h2>2. Payment Method</h2>
            </div>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-retail-accent bg-blue-50/40 ring-1 ring-retail-accent'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={() => setPaymentMethod('CREDIT_CARD')}
                    className="text-retail-accent focus:ring-retail-accent"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Credit / Debit Card (Mock Sim)</p>
                    <p className="text-xs text-gray-500">Instant test payment simulator</p>
                  </div>
                </div>
                <div className="flex gap-1 text-xs font-bold text-gray-400">
                  <span>VISA</span> &bull; <span>MC</span> &bull; <span>AMEX</span>
                </div>
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'PAYPAL'
                    ? 'border-retail-accent bg-blue-50/40 ring-1 ring-retail-accent'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYPAL"
                    checked={paymentMethod === 'PAYPAL'}
                    onChange={() => setPaymentMethod('PAYPAL')}
                    className="text-retail-accent focus:ring-retail-accent"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">PayPal Express</p>
                    <p className="text-xs text-gray-500">Pay safely using your PayPal wallet</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600">PayPal</span>
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-retail-accent bg-blue-50/40 ring-1 ring-retail-accent'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-retail-accent focus:ring-retail-accent"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</p>
                    <p className="text-xs text-gray-500">Pay upon parcel arrival</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Review Sidebar */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
            Review Items ({cart.totalItems})
          </h2>

          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-xs">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 text-xs">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="font-semibold text-emerald-600">Free Express</span>
            </div>
            <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
              <span>Total Due</span>
              <span className="text-xl text-retail-accent">{formatCurrency(cart.subtotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-retail-dark hover:bg-retail-accent text-white font-bold text-base shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Processing Order...
              </span>
            ) : (
              <>
                <span>Confirm & Place Order</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Real-time transaction logging to Prometheus</span>
          </div>
        </div>
      </form>
    </div>
  );
};
