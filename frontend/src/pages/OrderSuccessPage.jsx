import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Home, Clock } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';

export const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      api
        .get(`/orders/${id}`)
        .then((res) => setOrder(res.data.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retail-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8">
      {/* Animated Success Badge */}
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50/50">
        <CheckCircle2 size={44} />
      </div>

      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Order Confirmed
        </span>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
          Thank You For Your Purchase!
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Your order has been recorded into the RetailMax database and dispatched to our logistics pipeline.
        </p>
      </div>

      {order && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 text-left shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <p className="text-xs text-gray-400 font-medium">Order Number</p>
              <p className="text-base font-extrabold text-gray-900 font-mono">
                {order.orderNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Order Status</p>
              <div className="mt-1">
                <StatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Date Placed</p>
              <p className="text-xs font-semibold text-gray-800">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Ordered Items
            </h4>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    {item.product?.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 text-xs">
                        {item.product?.name || 'Product'}
                      </p>
                      <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 text-xs">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Summary */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-gray-700">Delivery Address:</p>
              <p className="text-gray-500 mt-0.5 leading-relaxed">{order.shippingAddress}</p>
            </div>
            <div className="sm:text-right space-y-1">
              <p className="text-gray-500">
                Payment: <span className="font-semibold text-gray-800">{order.paymentMethod}</span>
              </p>
              <p className="text-sm font-bold text-gray-900">
                Total Paid:{' '}
                <span className="text-retail-accent font-black text-base">
                  {formatCurrency(order.totalAmount)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-retail-dark hover:bg-retail-accent text-white font-semibold text-sm transition-all shadow-sm"
        >
          <Package size={16} />
          <span>Track Order History</span>
        </Link>
        <Link
          to="/products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors"
        >
          <Home size={16} />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
};

