import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  price: z.number().positive('Price must be greater than zero'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  imageUrl: z.string().url('A valid image URL is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  featured: z.boolean().optional().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  featured: z.string().optional(),
  sort: z.enum(['price-asc', 'price-desc', 'newest', 'name-asc']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

