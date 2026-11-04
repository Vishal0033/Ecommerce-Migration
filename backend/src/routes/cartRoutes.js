import { Router } from 'express';
import {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateMiddleware.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/cartValidator.js';

const router = Router();

// All cart routes require user authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/add', validateBody(addToCartSchema), addToCart);
router.put('/:productId', validateBody(updateCartItemSchema), updateQuantity);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

export default router;
