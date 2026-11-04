import { httpRequestDurationHistogram, httpRequestsTotal } from '../metrics/prometheus.js';

export const metricsMiddleware = (req, res, next) => {
  // Ignore Prometheus scraper requests itself from skewing latency metrics
  if (req.path === '/metrics' || req.path === '/health') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    // Normalize route path to prevent high cardinality (e.g. /api/products/123 -> /api/products/:id)
    const route = req.baseUrl + (req.route ? req.route.path : req.path);
    const statusCode = res.statusCode.toString();

    httpRequestDurationHistogram.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      durationInSeconds
    );

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });
  });

  next();
};

