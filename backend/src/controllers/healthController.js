import { checkDbConnection } from '../config/prisma.js';

export const getHealth = async (req, res) => {
  const dbHealth = await checkDbConnection();
  const uptimeSeconds = Math.floor(process.uptime());
  const memoryUsage = process.memoryUsage();

  const isHealthy = dbHealth.status === 'healthy';

  const healthData = {
    status: isHealthy ? 'UP' : 'DOWN',
    service: 'retailmax-monolith-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    database: dbHealth,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  return res.status(isHealthy ? 200 : 503).json(healthData);
};
