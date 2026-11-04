# RetailMax Architecture & System Design Document

## 1. System Overview
**RetailMax** is an enterprise-grade full-stack e-commerce monolithic application engineered specifically for modernization, containerization, and zero-downtime cloud migration to Amazon Web Services (AWS).

```
+-------------------------------------------------------------------------+
|                               Client Layer                              |
|                 React.js 18 + Tailwind CSS + Lucide Icons               |
|            (Catalog, Shopping Cart, Orders, Admin Dashboard)             |
+------------------------------------+------------------------------------+
                                     |
                          Reverse Proxy / LB
                          (Nginx Blue-Green)
                                     |
+------------------------------------+------------------------------------+
|                         Node.js & Express API                           |
|  +-------------------------------------------------------------------+  |
|  | Middlewares: Helmet, CORS, Rate Limit, Auth (JWT), Validation     |  |
|  +-------------------------------------------------------------------+  |
|  | Controllers: Auth, Products, Cart, Orders, Admin, Health, Metrics  |  |
|  +-------------------------------------------------------------------+  |
|  | Services: Business logic, Cart calculations, Order transactions   |  |
|  +-------------------------------------------------------------------+  |
|  | Repositories: Data access layer, Atomic DB transactions          |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                             Prisma ORM Client
                                     |
+------------------------------------+------------------------------------+
|                             Database                                    |
|          PostgreSQL 16 (AWS RDS / Docker) / SQLite (Dev Mode)           |
+------------------------------------+------------------------------------+
                                     |
                           Observability Agent
                         (Prometheus /metrics)
                                     |
                                  Grafana
```

---

## 2. Architectural Principles & Separation of Concerns

### A. Reusability & Modularity
- **Layered Monolith Architecture**: The codebase is decomposed into distinct, loosely-coupled layers:
  1. **Config Layer (`src/config/`)**: Environment variables, singletons (Prisma, Logger).
  2. **Middlewares (`src/middlewares/`)**: Cross-cutting concerns such as security headers (`helmet`), rate limiting (`express-rate-limit`), token authentication (`authMiddleware`), role-based authorization (`roleMiddleware`), request validation (`validateMiddleware`), and error handling (`errorMiddleware`).
  3. **Validators (`src/validators/`)**: Declarative schema validation powered by **Zod**. Every incoming request payload is sanitized and strongly validated before reaching the controllers.
  4. **Controllers (`src/controllers/`)**: Thin HTTP orchestration layer that extracts input from HTTP requests, delegates work to services, and returns standardized JSON responses.
  5. **Services (`src/services/`)**: Pure business logic layer. Implements business rules (e.g., checking available product stock, applying cart calculations, enforcing authorization rules, recording business telemetry).
  6. **Repositories (`src/repositories/`)**: Data access layer isolating Prisma ORM queries from business logic. Enables atomic multi-step database transactions (`prisma.$transaction`).
  7. **Metrics (`src/metrics/`)**: Observability instrumentation exposing standard Prometheus scrapable metrics.

### B. Security
- **Bcrypt Password Hashing**: Passwords are never stored in plaintext and are salted with 10 rounds of bcrypt.
- **JWT Authentication**: Stateless, tamper-proof JSON Web Tokens signed with a secret key and configurable expiry.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions distinguishing `USER` from `ADMIN` roles. Critical operations (product creation/updating/deletion, order status modification, dashboard KPI analytics) are protected at both route and controller levels.
- **Helmet HTTP Headers**: Mitigates Cross-Site Scripting (XSS), clickjacking, and MIME-sniffing.
- **Rate Limiting**: Protects against automated brute-force attacks and volumetric DDoS.
- **Prisma SQL Injection Defense**: Prisma utilizes parameterized queries exclusively, eliminating SQL injection vectors.

### C. Scalability & High Availability
- **Stateless Application Server**: The Express monolith stores no in-memory user sessions. Authentication is token-based and carts/orders are persisted in the database.
- **Horizontal Scalability**: Multiple container instances can be placed behind an AWS Application Load Balancer without session synchronization issues.
- **Database Connection Pooling**: Prisma manages a resilient connection pool to PostgreSQL.

### D. Observability & Monitoring
- **Health Check Endpoint (`/health`)**: Exposes database connectivity, process uptime, memory RSS/heap, and timestamp. Built to respond to AWS ALB and Docker health checks.
- **Prometheus Telemetry (`/metrics`)**: Exposes system metrics (CPU, memory, event loop lag) and custom application metrics:
  - `retailmax_http_request_duration_seconds` (Histogram across methods and routes)
  - `retailmax_http_requests_total` (Request counter)
  - `retailmax_orders_total` (Order transaction counter)
  - `retailmax_revenue_total_dollars` (Cumulative gross revenue)

