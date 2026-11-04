import { Router } from 'express';
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { validateBody } from '../middlewares/validateMiddleware.js';
import { updateOrderStatusSchema } from '../validators/orderValidator.js';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', validateBody(updateOrderStatusSchema), updateOrderStatus);

export default router;

