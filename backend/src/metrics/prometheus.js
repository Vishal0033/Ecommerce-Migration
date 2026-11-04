import client from 'prom-client';

// Create a Registry which registers the metrics
export const register = new client.Registry();

// Add default recommended system metrics (CPU, Memory, Event Loop, GC, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'retailmax_',
});

// Custom HTTP Request Duration Histogram
export const httpRequestDurationHistogram = new client.Histogram({
  name: 'retailmax_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});
register.registerMetric(httpRequestDurationHistogram);

// Custom HTTP Total Requests Counter
export const httpRequestsTotal = new client.Counter({
  name: 'retailmax_http_requests_total',
  help: 'Total number of HTTP requests made',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestsTotal);

// Custom Business Metrics for RetailMax
export const totalOrdersCounter = new client.Counter({
  name: 'retailmax_orders_total',
  help: 'Total number of orders placed through the platform',
  labelNames: ['payment_method', 'status'],
});
register.registerMetric(totalOrdersCounter);

export const totalRevenueGauge = new client.Gauge({
  name: 'retailmax_revenue_total_dollars',
  help: 'Total cumulative revenue processed',
});
register.registerMetric(totalRevenueGauge);
