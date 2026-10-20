const assert = require('node:assert/strict');
const { test } = require('node:test');
const { HealthController } = require('../dist/health/health.controller');

test('health endpoint checks the database connection', async () => {
  const result = { status: 'ok' };
  const health = {
    check: async (checks) => checks[0](),
  };
  const database = {
    pingCheck: async (...args) => {
      calls.push(args);
      return result;
    },
  };
  const calls = [];
  const controller = new HealthController(health, database);

  assert.deepEqual(await controller.check(), result);
  assert.deepEqual(calls, [['database', { timeout: 3000 }]]);
});
