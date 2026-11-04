import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Star,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  ChevronRight,
} from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        const currentProduct = res.data.data;
        setProduct(currentProduct);

        // Fetch related products from same category
        if (currentProduct.categoryId) {
          const relRes = await api.get(`/products?category=${currentProduct.categoryId}&limit=4`);
          setRelatedProducts(
            relRes.data.data.products.filter((p) => p.id !== currentProduct.id)
          );
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
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

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The product you are looking for does not exist or was removed.</p>
        <Link
          to="/products"
          className="px-6 py-3 bg-retail-accent text-white font-semibold rounded-xl"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-gray-500">
        <Link to="/" className="hover:text-retail-accent">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-retail-accent">Products</Link>
        <ChevronRight size={14} />
        <Link
          to={`/products?category=${product.category?.slug}`}
          className="hover:text-retail-accent"
        >
          {product.category?.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Image Container */}
        <div className="relative rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 aspect-square shadow-sm">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center"
          />
          {product.featured && (
            <span className="absolute top-4 left-4 bg-retail-navy/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md shadow-md">
              Featured Pick
            </span>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-retail-accent uppercase tracking-wider">
              {product.category?.name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mt-1 leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Rating & Stock */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-amber-400">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700 ml-1">4.9 / 5.0</span>
              <span className="text-xs text-gray-400 ml-1">(128 reviews)</span>
            </div>

            <div>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  In Stock ({product.stock} units available)
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-3xl font-black text-gray-900">
            {formatCurrency(product.price)}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Quantity and Add to Cart */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-xl bg-white p-1 shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition-all ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-retail-dark hover:bg-retail-accent text-white shadow-slate-900/10'
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-retail-accent flex-shrink-0" />
              <span>Fast Express Dispatch</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-retail-accent flex-shrink-0" />
              <span>1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={16} className="text-retail-accent flex-shrink-0" />
              <span>30-Day Free Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-gray-200">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
