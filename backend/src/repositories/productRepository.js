import prisma from '../config/prisma.js';

export const productRepository = {
  findAll: async ({ category, search, minPrice, maxPrice, featured, sort, skip = 0, take = 20 }) => {
    const where = {};

    if (category) {
      where.OR = [
        { category: { slug: category } },
        { categoryId: category }
      ];
    }

    if (search) {
      where.name = {
        contains: search,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
      if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
    }

    if (featured !== undefined) {
      where.featured = featured === 'true' || featured === true;
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'name-asc') orderBy = { name: 'asc' };
    if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  },

  findById: async (id) => {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  },

  findBySlug: async (slug) => {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });
  },

  create: async (data) => {
    return await prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  },

  update: async (id, data) => {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  },

  delete: async (id) => {
    return await prisma.product.delete({
      where: { id },
    });
  },

  count: async () => {
    return await prisma.product.count();
  },

  findAllCategories: async () => {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  },
};

