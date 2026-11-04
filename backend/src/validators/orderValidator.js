import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingAddress: z.string().min(5, 'Full shipping address is required'),
  paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'COD']).default('CREDIT_CARD'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

