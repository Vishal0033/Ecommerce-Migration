import { adminService } from '../services/adminService.js';
import { orderService } from '../services/orderService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, stats, 'Admin dashboard statistics retrieved');
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrdersForAdmin(req.query);
    return sendSuccess(res, orders, 'All orders retrieved for admin');
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const updated = await orderService.updateOrderStatus(req.params.id, req.body.status);
    return sendSuccess(res, updated, 'Order status updated successfully');
  } catch (error) {
    next(error);
  }
};
