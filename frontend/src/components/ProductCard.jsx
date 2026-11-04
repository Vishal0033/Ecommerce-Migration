import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden bg-gray-100 aspect-square">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Featured Tag */}
        {product.featured && (
          <span className="absolute top-3 left-3 bg-retail-navy/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm">
            Featured
          </span>
        )}

        {/* Stock Status Tag */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 bg-rose-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Out of Stock
          </span>
        ) : product.stock < 10 ? (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Only {product.stock} left
          </span>
        ) : null}
      </Link>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category */}
        <div className="text-xs font-semibold text-retail-accent uppercase tracking-wider mb-1.5">
          {product.category?.name || 'General'}
        </div>

        {/* Title */}
        <Link to={`/products/${product.id}`} className="hover:text-retail-accent transition-colors">
          <h3 className="font-semibold text-gray-900 text-base line-clamp-2 mb-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating snippet */}
        <div className="flex items-center gap-1 text-amber-400 mb-3 text-xs">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-gray-500 ml-1 font-medium">(4.9)</span>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block font-medium">Price</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-retail-dark hover:bg-retail-accent text-white active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check size={16} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

