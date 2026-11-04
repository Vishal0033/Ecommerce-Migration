import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export const CartDrawer = () => {
  const { cart, isCartOpen, closeCart, updateQuantity, removeFromCart } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-retail-accent" size={22} />
              <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-blue-50 text-retail-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Your cart is empty</h3>
                <p className="text-sm text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                <button
                  onClick={closeCart}
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-retail-accent text-white font-medium rounded-xl hover:bg-retail-accentHover transition-colors text-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-all"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {formatCurrency(item.product.price)} each
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:text-gray-900"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Subtotal & Checkout */}
          {cart.items.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax & Shipping</span>
                  <span className="text-xs text-emerald-600 font-medium">Free Express Delivery</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-retail-accent">{formatCurrency(cart.subtotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="w-full py-3 px-4 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100 transition-colors text-center text-sm"
                >
                  View Full Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full py-3 px-4 rounded-xl bg-retail-dark hover:bg-retail-accent text-white font-semibold transition-all text-center text-sm flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10"
                >
                  <span>Checkout</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

