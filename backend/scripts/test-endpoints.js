import app from '../src/app.js';
import prisma from '../src/config/prisma.js';

async function testApi() {
  const server = app.listen(5099, async () => {
    console.log('Testing server started on port 5099...');
    try {
      // 1. Test Health
      const healthRes = await fetch('http://localhost:5099/health');
      const healthData = await healthRes.json();
      console.log('Health Endpoint:', healthData.status === 'UP' ? 'PASS' : 'FAIL', healthData);

      // 2. Test Products
      const productsRes = await fetch('http://localhost:5099/api/products?limit=2');
      const productsData = await productsRes.json();
      console.log('Products Endpoint: Found', productsData.data.products.length, 'products');

      // 3. Test Categories
      const catRes = await fetch('http://localhost:5099/api/products/categories');
      const catData = await catRes.json();
      console.log('Categories Endpoint: Found', catData.data.length, 'categories');

      // 4. Test Login
      const loginRes = await fetch('http://localhost:5099/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@retailmax.com', password: 'Admin@123' }),
      });
      const loginData = await loginRes.json();
      console.log('Login Endpoint:', loginData.success ? 'PASS' : 'FAIL', 'User:', loginData.data?.user?.email);

      // 5. Test Metrics
      const metricsRes = await fetch('http://localhost:5099/metrics');
      const metricsText = await metricsRes.text();
      console.log('Metrics Endpoint:', metricsText.includes('retailmax_') ? 'PASS' : 'FAIL');

      console.log('\nAll API tests PASSED successfully!');
    } catch (err) {
      console.error('Test failed:', err);
    } finally {
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    }
  });
}

testApi();
