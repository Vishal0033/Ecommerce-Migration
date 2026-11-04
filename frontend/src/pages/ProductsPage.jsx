import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import { ProductCard } from '../components/ProductCard';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  // Query parameters state
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    // Fetch categories
    api
      .get('/products/categories')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchQuery) params.append('search', searchQuery);
        if (sort) params.append('sort', sort);
        params.append('limit', '24');

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.data.products);
        setPagination(res.data.data.pagination);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, searchQuery, sort]);

  const handleCategoryChange = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) {
      next.set('category', slug);
    } else {
      next.delete('category');
    }
    setSearchParams(next);
  };

  const handleSortChange = (e) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', e.target.value);
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Products'
              : 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing {products.length} of {pagination.total} high-quality items in stock
          </p>
        </div>

        {/* Sort & Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm">
            <Filter size={16} className="text-gray-400" />
            <label htmlFor="sort-select" className="text-xs text-gray-500 font-semibold uppercase">Sort:</label>
            <select
              id="sort-select"
              value={sort}
              onChange={handleSortChange}
              className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical</option>
            </select>
          </div>

          {(selectedCategory || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw size={14} />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategoryChange('')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shadow-sm ${
            !selectedCategory
              ? 'bg-retail-dark text-white shadow-slate-900/10'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap shadow-sm ${
              selectedCategory === cat.slug
                ? 'bg-retail-accent text-white shadow-blue-500/20'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            We couldn't find any products matching your current filters. Try searching for something else or reset your criteria.
          </p>
          <button
            onClick={handleClearFilters}
            className="px-5 py-2.5 rounded-xl bg-retail-accent text-white text-sm font-semibold hover:bg-retail-accentHover transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
