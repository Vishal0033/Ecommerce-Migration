import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../controllers/productController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { validateBody, validateQuery } from '../middlewares/validateMiddleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validators/productValidator.js';

const router = Router();

// Public routes
router.get('/', validateQuery(productQuerySchema), getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin-only management routes
router.post(
  '/',
  authenticate,
  requireRole('ADMIN'),
  validateBody(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validateBody(updateProductSchema),
  updateProduct
);

router.delete('/:id', authenticate, requireRole('ADMIN'), deleteProduct);

export default router;

