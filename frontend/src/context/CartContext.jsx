import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, subtotal: 0 });
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from backend or localStorage
  const fetchCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.get('/cart');
        setCart(res.data.data);
      } catch (err) {
        console.error('Failed to load cart from server:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Load local guest cart
      const saved = localStorage.getItem('retailmax_guest_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCart(parsed);
        } catch (e) {
          localStorage.removeItem('retailmax_guest_cart');
        }
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  // Recalculate guest cart totals
  const recalculateGuestCart = (items) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const updated = {
      items,
      totalItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
    };
    setCart(updated);
    localStorage.setItem('retailmax_guest_cart', JSON.stringify(updated));
    return updated;
  };

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.post('/cart/add', {
          productId: product.id,
          quantity,
        });
        setCart(res.data.data);
        setIsCartOpen(true);
        return res.data.data;
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      // Guest cart logic
      const items = [...cart.items];
      const existingIndex = items.findIndex((i) => i.product.id === product.id);

      if (existingIndex > -1) {
        items[existingIndex].quantity += quantity;
      } else {
        items.push({
          id: `guest-${Date.now()}`,
          productId: product.id,
          quantity,
          product,
        });
      }

      const updated = recalculateGuestCart(items);
      setIsCartOpen(true);
      return updated;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.put(`/cart/${productId}`, { quantity });
        setCart(res.data.data);
        return res.data.data;
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      let items = [...cart.items];
      if (quantity <= 0) {
        items = items.filter((i) => i.product.id !== productId);
      } else {
        const item = items.find((i) => i.product.id === productId);
        if (item) item.quantity = quantity;
      }
      return recalculateGuestCart(items);
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.delete(`/cart/${productId}`);
        setCart(res.data.data);
        return res.data.data;
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    } else {
      const items = cart.items.filter((i) => i.product.id !== productId);
      return recalculateGuestCart(items);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.error('Error clearing remote cart:', err);
      }
    }
    const empty = { items: [], totalItems: 0, subtotal: 0 };
    setCart(empty);
    localStorage.removeItem('retailmax_guest_cart');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

