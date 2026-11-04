# RetailMax REST API Documentation

Base URL: `http://localhost:5000/api` (or `/` for system endpoints)

## 1. System Endpoints

### `GET /health`
- **Description**: Health check endpoint for AWS ALB & Nginx monitoring.
- **Response**:
```json
{
  "status": "UP",
  "service": "retailmax-monolith-api",
  "version": "1.0.0",
  "timestamp": "2026-11-04T12:00:00.000Z",
  "uptime": "120s",
  "database": { "status": "healthy", "latencyMs": 0 },
  "memory": { "rss": "75 MB", "heapTotal": "32 MB", "heapUsed": "18 MB" }
}
```

### `GET /metrics`
- **Description**: Prometheus metrics scraper endpoint in standard Prometheus text format.

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Body**: `{ "name": "Jane Doe", "email": "jane@example.com", "password": "Password@123", "role": "USER" }`
- **Response**: `201 Created` with User object and JWT token.

### `POST /api/auth/login`
- **Body**: `{ "email": "admin@retailmax.com", "password": "Admin@123" }`
- **Response**: `200 OK` with User object and JWT token.

### `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Current authenticated user profile.

---

## 3. Product Catalog (`/api/products`)

### `GET /api/products`
- **Query Params**:
  - `category` (slug or ID)
  - `search` (text search)
  - `minPrice`, `maxPrice`
  - `sort` (`newest`, `price-asc`, `price-desc`, `name-asc`)
  - `featured` (`true`/`false`)
  - `page`, `limit`

### `GET /api/products/categories`
- **Response**: All product categories with item count.

### `GET /api/products/:id`
- **Response**: Detailed product record with category.

### `POST /api/products` *(Admin Only)*
- **Headers**: `Authorization: Bearer <admin-token>`
- **Body**:
```json
{
  "name": "Noise Cancelling Headphones",
  "description": "Premium wireless audio",
  "price": 199.99,
  "stock": 50,
  "imageUrl": "https://...",
  "categoryId": "category-uuid",
  "featured": true
}
```

### `PUT /api/products/:id` *(Admin Only)*
- **Body**: Partial product fields to update.

### `DELETE /api/products/:id` *(Admin Only)*

---

## 4. Shopping Cart (`/api/cart`)
*Requires `Authorization: Bearer <token>`*

### `GET /api/cart`
- Returns cart items, total quantity, and calculated subtotal.

### `POST /api/cart/add`
- **Body**: `{ "productId": "uuid", "quantity": 1 }`

### `PUT /api/cart/:productId`
- **Body**: `{ "quantity": 3 }`

### `DELETE /api/cart/:productId`

### `DELETE /api/cart` (Clear Cart)

---

## 5. Orders & Checkout (`/api/orders`)
*Requires `Authorization: Bearer <token>`*

### `POST /api/orders/checkout`
- **Body**:
```json
{
  "shippingAddress": "123 Elm St, San Francisco, CA 94101",
  "paymentMethod": "CREDIT_CARD"
}
```
- **Process**: Atomically validates stock, decrements inventory, creates order, records Prometheus metric, and clears cart.

### `GET /api/orders`
- Returns order history for current logged-in user.

### `GET /api/orders/:id`
- Returns order details (User can only view their own order; Admin can view all).

---

## 6. Admin Management (`/api/admin`)
*Requires `Authorization: Bearer <admin-token>`*

### `GET /api/admin/stats`
- Returns revenue, total orders, total products, user count, and recent orders.

### `GET /api/admin/orders`
- Returns paginated list of all customer orders.

### `PATCH /api/admin/orders/:id/status`
- **Body**: `{ "status": "SHIPPED" }` (PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED)
