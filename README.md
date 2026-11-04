# RetailMax: E-Commerce Monolith Cloud Migration Platform

[![Architecture: Layered Monolith](https://img.shields.io/badge/Architecture-Clean%20Layered%20Monolith-blue.svg)](docs/ARCHITECTURE.md)
[![Database: Prisma + Postgres](https://img.shields.io/badge/Database-Prisma%20ORM%20%2B%20PostgreSQL-336791.svg)](https://prisma.io)
[![Observability: Prometheus](https://img.shields.io/badge/Metrics-Prometheus%20Scrapable-E6522C.svg)](docs/MIGRATION_GUIDE.md)
[![Deployment: Zero--Downtime](https://img.shields.io/badge/Releases-Nginx%20Blue--Green-22c55e.svg)](docs/MIGRATION_GUIDE.md)

> Modern full-stack e-commerce monolithic application built for automated DevOps deployment, AWS cloud migration, and zero-downtime releases.

---

## 📌 Project Overview
**RetailMax** is an established online retailer running a monolithic e-commerce application. This project develops the modern full-stack application from scratch with clean architectural separation of concerns, ready to be migrated to the AWS Cloud using automated DevOps pipelines (Terraform, Ansible, Jenkins, Docker, Nginx Blue-Green, Prometheus, and Grafana).

### Core Features:
- 🛍️ **User Experience**: Browse high-res product catalog, filter by category, price, and search, view rich details, stock counters, and reviews.
- 🛒 **Cart & Checkout**: Persistent cart (guest and authenticated), atomic inventory deduction with stock locks, shipping address forms, and multiple payment methods.
- 📦 **Order Tracking**: Order lifecycle management (`PENDING` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED`), invoice viewing, and order history.
- 🛡️ **Admin Portal**: Revenue statistics, inventory management (Create, Read, Update, Delete products), stock adjustments, and order fulfillment controls.
- 🔒 **Security**: Salted bcrypt password hashing, JWT stateless authentication, Helmet HTTP protection headers, rate limiting, and Zod input validation.
- 📊 **DevOps & Observability**: Dedicated `/health` endpoint for AWS Application Load Balancer health checks and `/metrics` endpoint with Prometheus client metrics.

---

## 🏗️ Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Tailwind CSS, Vite | Responsive Single Page App with Lucide icons |
| **Backend** | Node.js, Express.js | Layered Monolith (Routes, Controllers, Services, Repositories) |
| **ORM & DB** | Prisma ORM, PostgreSQL (Cloud) / SQLite (Dev) | Type-safe queries, migrations, atomic transactions |
| **Security** | JWT, bcryptjs, Helmet, Zod, Rate Limiting | Comprehensive security suite |
| **DevOps & CI/CD**| Docker, Docker Compose, Nginx, Jenkins | Container packaging, reverse proxy, Blue-Green |
| **IaC & Config** | Terraform, Ansible | AWS VPC, EC2, ALB, automated server setups |
| **Observability** | Prometheus, Grafana | Latency histograms, throughput counters, business gauges |

---

## 📁 Project Architecture & Structure

```
Ecommerce Migration/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL target schema (Cloud / AWS)
│   │   ├── schema.sqlite.prisma   # SQLite schema (Zero-setup local dev)
│   │   └── seed.js                # Database seeder (Admin, Users, Products)
│   ├── src/
│   │   ├── config/                # Environment, Prisma singleton, Logger
│   │   ├── controllers/           # HTTP controllers
│   │   ├── services/              # Pure business logic & order processing
│   │   ├── repositories/          # Prisma database access layer
│   │   ├── middlewares/           # Auth, Roles, Validation, Error, Metrics
│   │   ├── validators/            # Zod validation schemas
│   │   ├── metrics/               # Prometheus prom-client metrics
│   │   ├── routes/                # Express routing endpoints
│   │   ├── app.js                 # Express app configuration
│   │   └── server.js              # Server entry point & graceful shutdown
│   ├── Dockerfile                 # Production multi-stage Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI (Navbar, Footer, ProductCard, CartDrawer, etc.)
│   │   ├── context/               # AuthContext, CartContext
│   │   ├── pages/                 # Home, Products, ProductDetails, Cart, Checkout, Admin, Orders
│   │   ├── services/ & utils/     # Axios client, currency & date formatters
│   │   ├── App.jsx                # Routing configuration
│   │   └── main.jsx
│   ├── Dockerfile                 # Multi-stage Dockerfile with Nginx
│   └── package.json
│
├── nginx/
│   └── nginx.conf                 # Nginx Blue-Green reverse proxy & load balancer
├── prometheus/
│   └── prometheus.yml             # Prometheus metric scraper config
├── docker-compose.yml             # Full-stack local orchestration (App + Postgres + Prometheus + Grafana)
├── docs/
│   ├── ARCHITECTURE.md            # In-depth architectural design
│   ├── API_DOCS.md                # Full REST API specifications
│   └── MIGRATION_GUIDE.md         # AWS Cloud Migration roadmap
└── package.json
```

---

## ⚡ Quick Start Guide (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Setup the Database & Seed Sample Data
Run the cross-platform setup script to initialize the database with categories, products, and test accounts:
```bash
npm run db:setup
```

### 3. Start the Backend API
```bash
npm run backend
```
The API server will start on `http://localhost:5000`:
- 💚 **Health Status**: `http://localhost:5000/health`
- 📊 **Prometheus Metrics**: `http://localhost:5000/metrics`
- 🌐 **API Base**: `http://localhost:5000/api`

### 4. Start the Frontend Application
In a separate terminal:
```bash
npm run frontend
```
The React application will launch at `http://localhost:5173`.

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@retailmax.com` | `Admin@123` | Full dashboard access, product CRUD, order status updater |
| **Customer** | `user@retailmax.com` | `User@123` | Browse catalog, shopping cart, checkout, order history |

> *Note: On the login page, you can also click the 1-Click Demo buttons to log in instantly!*

---

## 🐳 Docker & Cloud Migration Orchestration

To run the complete production-grade cloud stack locally with Docker Compose:
```bash
docker-compose up --build
```
This spins up:
1. `retailmax-postgres`: PostgreSQL 16 database with persistent storage.
2. `retailmax-backend`: Express monolith API with automated database migrations.
3. `retailmax-frontend`: Static React build served through Nginx.
4. `retailmax-nginx-lb`: Reverse proxy configured for Blue-Green traffic routing.
5. `retailmax-prometheus`: Scrapes metrics from `:5000/metrics`.
6. `retailmax-grafana`: Dashboards available on `http://localhost:3001` (user: `admin`, pass: `admin`).

---

## 📚 Documentation
- [System Architecture & Separation of Concerns](docs/ARCHITECTURE.md)
- [REST API Specifications](docs/API_DOCS.md)
- [AWS Cloud Migration Guide](docs/MIGRATION_GUIDE.md)
