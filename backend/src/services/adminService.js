import { userRepository } from '../repositories/userRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';

export const adminService = {
  getDashboardStats: async () => {
    const [totalUsers, totalProducts, orderStats, recentOrdersResult] = await Promise.all([
      userRepository.count(),
      productRepository.count(),
      orderRepository.getStats(),
      orderRepository.findAll({ skip: 0, take: 5 }),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders: orderStats.totalOrders,
      totalRevenue: orderStats.totalRevenue,
      pendingOrders: orderStats.pendingOrders,
      recentOrders: recentOrdersResult.orders,
    };
  },
};
