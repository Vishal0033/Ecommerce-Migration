import { cartRepository } from '../repositories/cartRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { AppError } from '../utils/appError.js';

export const cartService = {
  getUserCart: async (userId) => {
    const items = await cartRepository.findByUserId(userId);
    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    return {
      items,
      totalItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
    };
  },

  addToCart: async (userId, productId, quantity) => {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} items in stock.`, 400);
    }

    const existingItem = await cartRepository.findItem(userId, productId);
    if (existingItem && existingItem.quantity + quantity > product.stock) {
      throw new AppError(`Cannot add more than ${product.stock} items to your cart.`, 400);
    }

    await cartRepository.upsertItem(userId, productId, quantity);
    return await cartService.getUserCart(userId);
  },

  updateItemQuantity: async (userId, productId, quantity) => {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    if (quantity > product.stock) {
      throw new AppError(`Only ${product.stock} units available in stock.`, 400);
    }

    if (quantity <= 0) {
      await cartRepository.removeItem(userId, productId);
    } else {
      await cartRepository.updateQuantity(userId, productId, quantity);
    }

    return await cartService.getUserCart(userId);
  },

  removeItem: async (userId, productId) => {
    await cartRepository.removeItem(userId, productId);
    return await cartService.getUserCart(userId);
  },

  clearCart: async (userId) => {
    await cartRepository.clearByUserId(userId);
    return { items: [], totalItems: 0, subtotal: 0 };
  },
};
