import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retail-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order History</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review, track, and manage all your past RetailMax purchases
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-retail-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={28} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">No orders placed yet</h2>
          <p className="text-sm text-gray-500 mb-6">You haven't made any purchases with this account.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-retail-accent text-white font-semibold rounded-xl text-sm hover:bg-retail-accentHover transition-colors"
          >
            <span>Start Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:border-gray-300 transition-all space-y-6"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-900 text-sm">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={13} />
                    <span>Placed on {formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">Total Order Amount</p>
                  <p className="text-lg font-black text-retail-accent">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Items grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100"
                  >
                    {item.product?.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-xl object-cover bg-white flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Qty: {item.quantity} &bull; {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Destination */}
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p>
                  <span className="font-semibold text-gray-700">Delivery Address:</span>{' '}
                  {order.shippingAddress}
                </p>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  Payment: {order.paymentMethod} ({order.paymentStatus})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
