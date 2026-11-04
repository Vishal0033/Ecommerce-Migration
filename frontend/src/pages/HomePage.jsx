import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, Clock } from 'lucide-react';
import api from '../utils/api';
import { ProductCard } from '../components/ProductCard';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/products/categories'),
        ]);
        setFeaturedProducts(prodRes.data.data.products);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-retail-navy to-slate-900 text-white my-6 shadow-2xl mx-4 sm:mx-6 lg:mx-8">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24 lg:py-28 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles size={14} />
              <span>RetailMax Next-Gen E-Commerce Monolith</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Premium Goods, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Cloud-Speed Delivery.
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Explore high-performance electronics, artisan lifestyle gear, and modern apparel. Built with high availability, automated CI/CD, and zero-downtime architecture.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-retail-accent hover:bg-retail-accentHover text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
              >
                <span>Explore Catalog</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/products?category=electronics"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-sm border border-white/10 transition-colors"
              >
                Top Electronics
              </Link>
            </div>
          </div>

          {/* Hero Visual Pill */}
          <div className="mt-12 lg:mt-0 lg:w-5/12 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                alt="Featured Product"
                className="rounded-xl w-full h-64 object-cover"
              />
              <div className="pt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-400 font-medium">Bestseller of the Week</p>
                  <p className="text-sm font-bold text-white">Aura Studio Headphones</p>
                </div>
                <span className="text-base font-extrabold text-white">$299.99</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & DevOps Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-retail-accent">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Free Express Delivery</h4>
              <p className="text-xs text-gray-500 mt-0.5">Complimentary shipping on orders</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Secure Payments</h4>
              <p className="text-xs text-gray-500 mt-0.5">Encrypted JWT auth & transactions</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">30-Day Easy Returns</h4>
              <p className="text-xs text-gray-500 mt-0.5">Hassle-free guarantee</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">99.99% Availability</h4>
              <p className="text-xs text-gray-500 mt-0.5">Blue-Green automated failover</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-retail-accent uppercase tracking-wider">
              Browse Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
              Curated Collections
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-retail-accent hover:text-retail-accentHover flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-900 border border-gray-100 shadow-sm"
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-base leading-tight group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-gray-300 mt-1">
                  {cat._count?.products || 0} Products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-retail-accent uppercase tracking-wider">
              Handpicked Deals
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-retail-accent hover:text-retail-accentHover flex items-center gap-1"
          >
            <span>See More Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 p-4 space-y-4 animate-pulse bg-white"
              >
                <div className="bg-gray-200 aspect-square rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

