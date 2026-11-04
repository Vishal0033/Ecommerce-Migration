import { orderService } from '../services/orderService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const checkout = async (req, res, next) => {
  try {
    const order = await orderService.checkout(req.user.id, req.body);
    return sendSuccess(res, order, 'Order placed successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    return sendSuccess(res, orders, 'Orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.user.id, req.params.id, req.user.role);
    return sendSuccess(res, order, 'Order retrieved successfully');
  } catch (error) {
    next(error);
  }
};
