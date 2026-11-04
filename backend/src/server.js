import app from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import prisma from './config/prisma.js';

const server = app.listen(config.port, () => {
  logger.info(`=================================================`);
  logger.info(`🚀 RetailMax API server running on port ${config.port}`);
  logger.info(`📊 Metrics available at http://localhost:${config.port}/metrics`);
  logger.info(`💚 Health check available at http://localhost:${config.port}/health`);
  logger.info(`🌐 Environment: ${config.env}`);
  logger.info(`=================================================`);
});

// Graceful shutdown helper
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    logger.info('Closed out remaining connections.');
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database disconnect:', err);
      process.exit(1);
    }
  });

  // Force shutdown if taking longer than 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection at:', promise);
  logger.error('Reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});
