import { orderRepository } from '../repositories/orderRepository.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { AppError } from '../utils/appError.js';
import { totalOrdersCounter, totalRevenueGauge } from '../metrics/prometheus.js';

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `RMX-${timestamp}-${random}`;
};

export const orderService = {
  checkout: async (userId, { shippingAddress, paymentMethod }) => {
    // 1. Fetch user's cart
    const cartItems = await cartRepository.findByUserId(userId);
    if (!cartItems || cartItems.length === 0) {
      throw new AppError('Your cart is empty. Add products before checking out.', 400);
    }

    // 2. Prepare items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}`,
          400
        );
      }
      totalAmount += item.product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      });
    }

    const orderNumber = generateOrderNumber();

    // 3. Execute atomic transaction (decrement stock, create order, clear cart)
    const order = await orderRepository.createOrderTransaction({
      userId,
      orderNumber,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      shippingAddress,
      paymentMethod,
      items: orderItems,
    });

    // 4. Update Prometheus metrics for cloud observability
    try {
      totalOrdersCounter.inc({
        payment_method: paymentMethod,
        status: order.status,
      });
      totalRevenueGauge.inc(order.totalAmount);
    } catch {
      // Metric error should not fail order placement
    }

    return order;
  },

  getUserOrders: async (userId) => {
    return await orderRepository.findByUserId(userId);
  },

  getOrderById: async (userId, orderId, userRole) => {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    // Authorization: User can only view their own order unless they are an ADMIN
    if (order.userId !== userId && userRole !== 'ADMIN') {
      throw new AppError('You do not have permission to view this order.', 403);
    }

    return order;
  },

  getAllOrdersForAdmin: async (queryParams) => {
    const page = parseInt(queryParams.page || '1', 10);
    const limit = parseInt(queryParams.limit || '20', 10);
    const skip = (page - 1) * limit;

    const { orders, total } = await orderRepository.findAll({
      status: queryParams.status,
      skip,
      take: limit,
    });

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  updateOrderStatus: async (orderId, status) => {
    const existing = await orderRepository.findById(orderId);
    if (!existing) {
      throw new AppError('Order not found.', 404);
    }

    return await orderRepository.updateStatus(orderId, status);
  },
};
