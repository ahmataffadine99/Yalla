const assert = require('node:assert/strict');
const { test } = require('node:test');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { RoutingService } = require('../dist/modules/locations/routing.service');
const { RouteRequestDto } = require('../dist/modules/locations/route-request.dto');

const request = {
  originLatitude: 12.1,
  originLongitude: 15.03,
  destinationLatitude: 12.12,
  destinationLongitude: 15.05,
};

function createService(baseUrl = 'http://routing.local') {
  return new RoutingService({
    get: () => baseUrl,
  });
}

async function withMockedFetch(mock, run) {
  const originalFetch = global.fetch;
  global.fetch = mock;

  try {
    await run();
  } finally {
    global.fetch = originalFetch;
  }
}

test('requests a driving route and returns kilometers and minutes', async () => {
  await withMockedFetch(async (input) => {
    const url = new URL(input);
    assert.equal(
      url.pathname,
      '/route/v1/driving/15.03,12.1;15.05,12.12',
    );
    assert.equal(url.searchParams.get('overview'), 'full');
    assert.equal(url.searchParams.get('geometries'), 'geojson');
    assert.equal(url.searchParams.get('steps'), 'false');

    return Response.json({
      code: 'Ok',
      routes: [{
        distance: 4690,
        duration: 343,
        geometry: { coordinates: [[15.03, 12.1], [15.05, 12.12]] },
      }],
    });
  }, async () => {
    assert.deepEqual(await createService().getRoute(request), {
      distanceMeters: 4690,
      durationSeconds: 343,
      distanceKm: 4.69,
      durationMinutes: 343 / 60,
      coordinates: [
        { latitude: 12.1, longitude: 15.03 },
        { latitude: 12.12, longitude: 15.05 },
      ],
    });
  });
});

test('fails explicitly when no routing provider is configured', async () => {
  await assert.rejects(
    createService('').getRoute(request),
    (error) => error.getStatus() === 503,
  );
});

test('validates and transforms route coordinates', async () => {
  const dto = plainToInstance(RouteRequestDto, {
    originLatitude: '12.1',
    originLongitude: '15.03',
    destinationLatitude: '12.12',
    destinationLongitude: '15.05',
  });

  assert.deepEqual(await validate(dto), []);
  assert.equal(dto.originLatitude, 12.1);

  const invalidDto = plainToInstance(RouteRequestDto, {
    originLatitude: 91,
    originLongitude: 15.03,
    destinationLatitude: 12.12,
    destinationLongitude: 181,
  });
  assert.ok((await validate(invalidDto)).length > 0);
});

test('rejects a provider response without a valid route', async () => {
  await withMockedFetch(async () => Response.json({ code: 'NoRoute' }), async () => {
    await assert.rejects(
      createService().getRoute(request),
      (error) => error.getStatus() === 502,
    );
  });
});

test('rejects malformed provider payloads instead of returning invalid results', async () => {
  await withMockedFetch(async () => Response.json(null), async () => {
    await assert.rejects(
      createService().getRoute(request),
      (error) => error.getStatus() === 502,
    );
  });
});

test('rejects invalid route geometry', async () => {
  await withMockedFetch(async () => Response.json({
    code: 'Ok',
    routes: [{
      distance: 1000,
      duration: 60,
      geometry: { coordinates: [[999, 12.1], [15.05, 12.12]] },
    }],
  }), async () => {
    await assert.rejects(
      createService().getRoute(request),
      (error) => error.getStatus() === 502,
    );
  });
});

test('reports provider HTTP failures as gateway errors', async () => {
  await withMockedFetch(async () => new Response(null, { status: 503 }), async () => {
    await assert.rejects(
      createService().getRoute(request),
      (error) => error.getStatus() === 502,
    );
  });
});

test('reports network failures as gateway errors', async () => {
  await withMockedFetch(async () => {
    throw new TypeError('network error');
  }, async () => {
    await assert.rejects(
      createService().getRoute(request),
      (error) => error.getStatus() === 502,
    );
  });
});
