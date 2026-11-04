import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-blue-50 text-retail-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-8 text-sm">
          You haven't added any products to your cart yet. Explore our store and discover top-quality items.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-retail-accent hover:bg-retail-accentHover text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20"
        >
          <span>Start Shopping</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review your {cart.totalItems} selected {cart.totalItems === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-20 h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                />
                <div>
                  <span className="text-[11px] font-bold text-retail-accent uppercase">
                    {item.product.category?.name || 'Item'}
                  </span>
                  <Link
                    to={`/products/${item.product.id}`}
                    className="font-bold text-gray-900 hover:text-retail-accent transition-colors block text-base leading-snug line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    Unit Price: {formatCurrency(item.product.price)}
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="text-right min-w-[90px]">
                  <p className="text-base font-black text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-2 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900">Order Summary</h2>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Items Total ({cart.totalItems})</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(cart.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping & Handling</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Sales Tax</span>
              <span className="font-semibold text-gray-900">$0.00</span>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between text-base font-black text-gray-900">
              <span>Grand Total</span>
              <span className="text-xl text-retail-accent">
                {formatCurrency(cart.subtotal)}
              </span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-retail-dark hover:bg-retail-accent text-white font-bold text-sm shadow-md shadow-slate-900/10 transition-all hover:-translate-y-0.5"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </Link>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Guaranteed 256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
