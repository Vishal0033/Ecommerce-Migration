import test from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';

test('App initialization and basic routes', async (t) => {
  await t.test('App instance is defined', () => {
    assert.ok(app);
  });
});
