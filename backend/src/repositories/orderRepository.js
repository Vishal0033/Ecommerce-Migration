import prisma from '../config/prisma.js';

export const orderRepository = {
  createOrderTransaction: async ({ userId, orderNumber, totalAmount, shippingAddress, paymentMethod, items }) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Check and decrement stock for all items
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 2. Create the Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          totalAmount,
          shippingAddress,
          paymentMethod,
          status: 'PENDING',
          paymentStatus: 'PAID',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 3. Clear the user's cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return order;
    });
  },

  findByUserId: async (userId) => {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id) => {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  findByOrderNumber: async (orderNumber) => {
    return await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  findAll: async ({ status, skip = 0, take = 50 }) => {
    const where = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, price: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  },

  updateStatus: async (id, status) => {
    return await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  },

  getStats: async () => {
    const [totalOrders, totalRevenueResult, pendingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenueResult._sum.totalAmount || 0,
      pendingOrders,
    };
  },
};
