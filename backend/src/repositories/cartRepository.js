import prisma from '../config/prisma.js';

export const cartRepository = {
  findByUserId: async (userId) => {
    return await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  findItem: async (userId, productId) => {
    return await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  },

  upsertItem: async (userId, productId, quantity) => {
    return await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });
  },

  updateQuantity: async (userId, productId, quantity) => {
    return await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: { quantity },
      include: {
        product: true,
      },
    });
  },

  removeItem: async (userId, productId) => {
    return await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  },

  clearByUserId: async (userId) => {
    return await prisma.cartItem.deleteMany({
      where: { userId },
    });
  },
};

