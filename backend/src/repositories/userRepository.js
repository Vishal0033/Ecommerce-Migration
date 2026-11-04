import prisma from '../config/prisma.js';

export const userRepository = {
  findByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  findById: async (id) => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  create: async (userData) => {
    return await prisma.user.create({
      data: {
        ...userData,
        email: userData.email.toLowerCase(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  },

  count: async () => {
    return await prisma.user.count();
  },
};

