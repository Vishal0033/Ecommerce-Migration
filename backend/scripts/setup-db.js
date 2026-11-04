import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(backendRoot, '.env') });

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

console.log(`\n======================================================`);
console.log(`⚙️  RetailMax Database Setup Engine`);
console.log(`🔌 Target Provider: ${isPostgres ? 'PostgreSQL (Cloud / Docker)' : 'SQLite (Local Dev Mode)'}`);
console.log(`📍 Connection URL:  ${dbUrl}`);
console.log(`======================================================\n`);

const schemaPrismaPath = path.join(backendRoot, 'prisma', 'schema.prisma');
const schemaSqlitePath = path.join(backendRoot, 'prisma', 'schema.sqlite.prisma');

if (!isPostgres) {
  // If SQLite, copy the SQLite schema over schema.prisma
  console.log('🔄 Syncing SQLite schema...');
  fs.copyFileSync(schemaSqlitePath, schemaPrismaPath);
}

try {
  console.log('🔨 Generating Prisma Client...');
  execSync('npx prisma generate', { cwd: backendRoot, stdio: 'inherit' });

  console.log('📦 Pushing database schema...');
  execSync('npx prisma db push --accept-data-loss', { cwd: backendRoot, stdio: 'inherit' });

  console.log('🌱 Seeding sample data (Admin, Users, Products, Categories)...');
  execSync('node prisma/seed.js', { cwd: backendRoot, stdio: 'inherit' });

  console.log('\n✨ Database setup finished successfully!\n');
} catch (error) {
  console.error('\n❌ Error setting up database:', error.message);
  process.exit(1);
}

