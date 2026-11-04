import { productRepository } from '../repositories/productRepository.js';
import { AppError } from '../utils/appError.js';

// Helper to generate a slug from product title
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
};

export const productService = {
  getProducts: async (queryParams) => {
    const page = parseInt(queryParams.page || '1', 10);
    const limit = parseInt(queryParams.limit || '12', 10);
    const skip = (page - 1) * limit;

    const { products, total } = await productRepository.findAll({
      category: queryParams.category,
      search: queryParams.search,
      minPrice: queryParams.minPrice,
      maxPrice: queryParams.maxPrice,
      featured: queryParams.featured,
      sort: queryParams.sort,
      skip,
      take: limit,
    });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getProductById: async (id) => {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError('Product not found.', 404);
    }
    return product;
  },

  createProduct: async (productData) => {
    const slug = generateSlug(productData.name);
    return await productRepository.create({
      ...productData,
      slug,
    });
  },

  updateProduct: async (id, updateData) => {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError('Product not found to update.', 404);
    }

    return await productRepository.update(id, updateData);
  },

  deleteProduct: async (id) => {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new AppError('Product not found to delete.', 404);
    }

    return await productRepository.delete(id);
  },

  getCategories: async () => {
    return await productRepository.findAllCategories();
  },
};
