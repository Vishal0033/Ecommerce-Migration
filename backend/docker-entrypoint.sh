#!/bin/sh
set -e

echo "=========================================================="
echo "🚀 Starting RetailMax Backend Monolith Service"
echo "🔌 Target Database: $DATABASE_URL"
echo "=========================================================="

echo "📦 Ensuring database schema is synced with RDS PostgreSQL..."
npx prisma db push --accept-data-loss || echo "Notice: Prisma db push completed with status $?"

echo "🌱 Seeding initial data (Admin, Products, Categories)..."
node prisma/seed.js || echo "Notice: Seed skipped or records already present"

echo "⚡ Launching application process..."
exec "$@"

