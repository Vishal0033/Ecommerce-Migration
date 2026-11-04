import { cartService } from '../services/cartService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getUserCart(req.user.id);
    return sendSuccess(res, cart, 'Shopping cart retrieved');
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user.id, productId, quantity || 1);
    return sendSuccess(res, cart, 'Item added to cart');
  } catch (error) {
    next(error);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateItemQuantity(req.user.id, productId, quantity);
    return sendSuccess(res, cart, 'Cart updated');
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await cartService.removeItem(req.user.id, productId);
    return sendSuccess(res, cart, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.id);
    return sendSuccess(res, cart, 'Cart cleared');
  } catch (error) {
    next(error);
  }
};
