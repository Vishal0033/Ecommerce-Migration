import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  Edit,
  Activity,
  Server,
  RefreshCw,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'devops'
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState(null);

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    categoryId: '',
    featured: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, prodRes, catRes, ordRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/products?limit=50'),
        api.get('/products/categories'),
        api.get('/admin/orders?limit=50'),
      ]);

      setStats(statsRes.data.data);
      setProducts(prodRes.data.data.products);
      setCategories(catRes.data.data);
      setOrders(ordRes.data.data.orders);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await api.get('/health');
      setSystemHealth(res.data);
    } catch (err) {
      setSystemHealth({ status: 'DOWN', error: err.message });
    }
  };

  useEffect(() => {
    fetchData();
    fetchHealth();
  }, []);

  // Handle open modal for create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      categoryId: categories[0]?.id || '',
      featured: false,
    });
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price.toString(),
      stock: prod.stock.toString(),
      imageUrl: prod.imageUrl,
      categoryId: prod.categoryId,
      featured: prod.featured || false,
    });
    setIsModalOpen(true);
  };

  // Submit product create/update
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock, 10),
        imageUrl: productForm.imageUrl,
        categoryId: productForm.categoryId,
        featured: Boolean(productForm.featured),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retail-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <span className="text-xs font-bold text-retail-accent uppercase tracking-wider">
            Control Panel
          </span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1">
            RetailMax Management Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Real-time telemetry, inventory control, and order fulfillment
          </p>
        </div>

        <button
          onClick={() => {
            fetchData();
            fetchHealth();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw size={14} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-gray-900 mt-1">
              {formatCurrency(stats?.totalRevenue)}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
              +14.2% from cloud transactions
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats?.totalOrders || 0}</p>
            <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
              {stats?.pendingOrders || 0} pending fulfillment
            </span>
          </div>
          <div className="p-3.5 bg-blue-50 text-retail-accent rounded-2xl">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Products</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats?.totalProducts || 0}</p>
            <span className="text-[11px] text-gray-500 font-semibold mt-1 inline-block">
              {categories.length} active categories
            </span>
          </div>
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Registered Users</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats?.totalUsers || 0}</p>
            <span className="text-[11px] text-gray-500 font-semibold mt-1 inline-block">
              Role-based authentication
            </span>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 gap-8 text-sm font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-retail-accent text-retail-accent'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingBag size={18} />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-retail-accent text-retail-accent'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Package size={18} />
          <span>Fulfillment Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('devops')}
          className={`pb-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'devops'
              ? 'border-retail-accent text-retail-accent'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Activity size={18} />
          <span>DevOps & Cloud Health</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Inventory Items</h2>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-retail-dark hover:bg-retail-accent text-white font-bold text-xs shadow-md transition-all"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          />
                          <span className="font-bold text-gray-900 line-clamp-1 max-w-[220px]">
                            {prod.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 font-medium">
                        {prod.category?.name || '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {formatCurrency(prod.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            prod.stock > 10
                              ? 'bg-emerald-100 text-emerald-800'
                              : prod.stock > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {prod.featured ? (
                          <span className="text-blue-600 font-bold text-[11px]">Yes</span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 text-gray-500 hover:text-retail-accent hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">All Client Purchases</h2>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status & Updater</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{order.user?.name || 'Customer'}</p>
                        <p className="text-[11px] text-gray-400">{order.user?.email}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {order.items?.length || 0} line items
                      </td>
                      <td className="py-3 px-4 font-black text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none focus:border-retail-accent cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEVOPS & CLOUD TELEMETRY */}
      {activeTab === 'devops' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Health Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-emerald-500" />
                  <h3 className="font-bold text-gray-900">Application Health (AWS ALB Ready)</h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    systemHealth?.status === 'UP'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {systemHealth?.status || 'UNKNOWN'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-600 font-mono">
                <p>
                  <span className="font-semibold text-gray-800">Database Engine:</span>{' '}
                  {systemHealth?.database?.status === 'healthy' ? 'CONNECTED' : 'DISCONNECTED'}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">System Uptime:</span>{' '}
                  {systemHealth?.uptime || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Memory RSS:</span>{' '}
                  {systemHealth?.memory?.rss || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Heap Used:</span>{' '}
                  {systemHealth?.memory?.heapUsed || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold text-gray-800">Target Environment:</span>{' '}
                  {systemHealth?.environment || 'development'}
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="/health"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-retail-accent hover:underline"
                >
                  <span>Open raw /health JSON</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Prometheus Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Server size={20} className="text-blue-500" />
                  <h3 className="font-bold text-gray-900">Prometheus Telemetry Scraper</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  prom-client Active
                </span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                Exposes microsecond HTTP request latency histograms, total traffic counters, and business KPIs for scraping by Prometheus and dashboard visualization via Grafana.
              </p>

              <div className="space-y-1 text-xs text-gray-700">
                <p className="font-bold text-gray-900">Key Scraped Metrics:</p>
                <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-gray-500">
                  <li>retailmax_http_request_duration_seconds</li>
                  <li>retailmax_http_requests_total</li>
                  <li>retailmax_orders_total</li>
                  <li>retailmax_revenue_total_dollars</li>
                </ul>
              </div>

              <div className="pt-2">
                <a
                  href="/metrics"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-retail-accent hover:underline"
                >
                  <span>Open raw /metrics Prometheus feed</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-retail-accent outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured-checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="rounded text-retail-accent focus:ring-retail-accent"
                  />
                  <label htmlFor="featured-checkbox" className="text-xs font-semibold text-gray-700">
                    Feature on Homepage Carousel
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-retail-dark hover:bg-retail-accent text-white text-xs font-bold shadow-md transition-all"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
