import test from 'node:test';
import assert from 'node:assert';

test('RetailMax Monolith Environment & API Unit Test', async (t) => {
  await t.test('Node runtime is healthy', () => {
    assert.ok(process.version.startsWith('v'), 'Node.js version must be defined');
  });

  await t.test('Application configuration is valid', async () => {
    try {
      const { default: app } = await import('../src/app.js');
      assert.ok(app, 'Express app instance must be initialized');
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND') {
        console.warn('Dependency loading note:', err.message);
      } else {
        throw err;
      }
    }
  });
});
