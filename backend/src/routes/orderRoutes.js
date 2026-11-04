import { Router } from 'express';
import {
  checkout,
  getUserOrders,
  getOrderById,
} from '../controllers/orderController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateMiddleware.js';
import { checkoutSchema } from '../validators/orderValidator.js';

const router = Router();

// Order routes require authentication
router.use(authenticate);

router.post('/checkout', validateBody(checkoutSchema), checkout);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

export default router;

