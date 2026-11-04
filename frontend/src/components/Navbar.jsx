import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      {/* Top micro banner */}
      <div className="bg-retail-dark text-gray-300 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>RetailMax Cloud Platform &bull; AWS Ready &bull; Zero-Downtime Monolith Architecture</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
              R
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-gray-900 leading-none">
                Retail<span className="text-retail-accent">Max</span>
              </span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                E-Commerce
              </span>
            </div>
          </Link>

          {/* Search bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search premium electronics, apparel, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 hover:bg-gray-100/80 focus:bg-white text-sm text-gray-900 rounded-full pl-10 pr-4 py-2 border border-transparent focus:border-retail-accent focus:outline-none transition-all shadow-inner"
              />
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </form>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-gray-700">
            <Link to="/products" className="hover:text-retail-accent transition-colors">
              All Products
            </Link>
            <Link to="/products?category=electronics" className="hover:text-retail-accent transition-colors">
              Electronics
            </Link>
            <Link to="/products?category=apparel" className="hover:text-retail-accent transition-colors">
              Apparel
            </Link>
            <Link to="/products?category=accessories" className="hover:text-retail-accent transition-colors">
              Accessories
            </Link>
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-full text-gray-700 hover:text-retail-accent hover:bg-gray-100 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag size={20} />
              {cart.totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-retail-accent text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center animate-scale">
                  {cart.totalItems}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-gray-200 hover:border-gray-300 bg-white transition-all shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-retail-accent flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-gray-800 hidden sm:inline max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-gray-400 mr-1" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            <ShieldCheck size={12} />
                            Administrator
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-retail-accent font-medium"
                        >
                          <LayoutDashboard size={16} />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-retail-accent font-medium"
                      >
                        <Package size={16} />
                        My Order History
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium text-left"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-retail-accent px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-semibold bg-retail-dark hover:bg-retail-accent text-white px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 space-y-3">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 text-sm text-gray-900 rounded-xl pl-10 pr-4 py-2 border border-transparent focus:border-retail-accent focus:outline-none"
                />
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </form>

            <nav className="flex flex-col space-y-2 text-sm font-medium text-gray-700 pt-2">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 rounded-lg hover:bg-gray-100"
              >
                All Products
              </Link>
              <Link
                to="/products?category=electronics"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 rounded-lg hover:bg-gray-100"
              >
                Electronics
              </Link>
              <Link
                to="/products?category=apparel"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 rounded-lg hover:bg-gray-100"
              >
                Apparel
              </Link>
              <Link
                to="/products?category=accessories"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 rounded-lg hover:bg-gray-100"
              >
                Accessories
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
