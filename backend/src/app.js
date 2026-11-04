import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config/env.js';
import { metricsMiddleware } from './middlewares/metricsMiddleware.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import apiRoutes from './routes/index.js';
import healthRoutes from './routes/healthRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
if (config.env !== 'test') {
  app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms'));
}

// Prometheus metrics recording middleware
app.use(metricsMiddleware);

// Rate limiting (Protects against brute force and DDoS)
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', limiter);

// DevOps / Monitoring Endpoints
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);
app.use('/metrics', metricsRoutes);

// Main API Routes
app.use('/api', apiRoutes);

// Root greeting / info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'RetailMax E-Commerce Monolith API',
    version: '1.0.0',
    description: 'DevOps & Cloud Migration Ready API Service',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: '/api',
    },
  });
});

// 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;

