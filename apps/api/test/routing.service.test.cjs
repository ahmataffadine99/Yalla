const assert = require('node:assert/strict');
const { test } = require('node:test');
const { plainToInstance } = require('class-transformer');
const { validate } = require('class-validator');
const { PlaceNameService } = require('../dist/modules/locations/place-name.service');
const { RoutingService } = require('../dist/modules/locations/routing.service');
const { PricingService } = require('../dist/modules/pricing/pricing.service');
const { LocationsController } = require('../dist/modules/locations/locations.controller');
const { PlaceNameDto } = require('../dist/modules/locations/place-name.dto');
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

function createPlaceNameService(baseUrl = 'https://nominatim.local') {
  return new PlaceNameService({
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

test('looks up a readable place name from selected coordinates', async () => {
  await withMockedFetch(async (input, options) => {
    const url = new URL(input);
    assert.equal(url.pathname, '/reverse');
    assert.equal(url.searchParams.get('lat'), '12.1');
    assert.equal(url.searchParams.get('lon'), '15.03');
    assert.equal(url.searchParams.get('format'), 'jsonv2');
    assert.equal(options.headers['Accept-Language'], 'fr');

    return Response.json({
      address: {
        road: 'Avenue Mobutu',
        suburb: 'Gardole',
        city: "N'Djamena",
      },
    });
  }, async () => {
    assert.deepEqual(
      await createPlaceNameService().findName({
        latitude: 12.1,
        longitude: 15.03,
      }),
      { label: "Avenue Mobutu, Gardole, N'Djamena" },
    );
  });
});

test('caches place-name lookups for nearby selected coordinates', async () => {
  let requestCount = 0;
  await withMockedFetch(async () => {
    requestCount += 1;
    return Response.json({ name: 'Place de la Nation' });
  }, async () => {
    const service = createPlaceNameService();
    const first = await service.findName({ latitude: 12.1, longitude: 15.03 });
    const second = await service.findName({
      latitude: 12.100001,
      longitude: 15.030001,
    });

    assert.deepEqual(first, { label: 'Place de la Nation' });
    assert.deepEqual(second, first);
    assert.equal(requestCount, 1);
  });
});

test('does not return coordinates as a fabricated place name', async () => {
  await withMockedFetch(async () => Response.json({ address: {} }), async () => {
    await assert.rejects(
      createPlaceNameService().findName({ latitude: 12.1, longitude: 15.03 }),
      (error) => error.getStatus() === 502,
    );
  });
});

test('fails explicitly when the place-name provider is not configured', async () => {
  await assert.rejects(
    createPlaceNameService('').findName({ latitude: 12.1, longitude: 15.03 }),
    (error) => error.getStatus() === 503,
  );
});

test('validates reverse-geocoding coordinates', async () => {
  const dto = plainToInstance(PlaceNameDto, {
    latitude: 12.1,
    longitude: 181,
  });
  assert.ok((await validate(dto)).length > 0);
});

test('calculates a route fare using the configured provisional XAF rates', () => {
  const service = new PricingService({
    getOrThrow(key) {
      return {
        FARE_BASE_XAF: 1000,
        FARE_PRICE_PER_KILOMETER_XAF: 350,
        FARE_PRICE_PER_MINUTE_XAF: 10,
      }[key];
    },
  });

  assert.deepEqual(service.calculateRouteFare(7.6517, 11.72), {
    fareXaf: 3796,
    minimumFareXaf: 1000,
    rates: {
      baseFareXaf: 1000,
      pricePerKilometerXaf: 350,
      pricePerMinuteXaf: 10,
    },
    vehicleOptions: [
      { vehicleType: 'express', fareXaf: 3796 },
      { vehicleType: 'standard', fareXaf: 4296 },
      { vehicleType: 'ousra', fareXaf: 4796 },
    ],
  });
});

test('includes the 1000 XAF base fare on short routes', () => {
  const service = new PricingService({
    getOrThrow(key) {
      return {
        FARE_BASE_XAF: 1000,
        FARE_PRICE_PER_KILOMETER_XAF: 350,
        FARE_PRICE_PER_MINUTE_XAF: 10,
      }[key];
    },
  });

  assert.equal(service.calculateRouteFare(0.5, 1).fareXaf, 1185);
});

test('adds the configured provisional surcharge to standard and van offers', () => {
  const service = new PricingService({
    getOrThrow(key) {
      return {
        FARE_BASE_XAF: 1000,
        FARE_PRICE_PER_KILOMETER_XAF: 350,
        FARE_PRICE_PER_MINUTE_XAF: 10,
      }[key];
    },
  });

  assert.deepEqual(
    service.calculateRouteFare(0.5, 1).vehicleOptions,
    [
      { vehicleType: 'express', fareXaf: 1185 },
      { vehicleType: 'standard', fareXaf: 1685 },
      { vehicleType: 'ousra', fareXaf: 2185 },
    ],
  );
});

test('returns a route and server-calculated fare from the quote endpoint', async () => {
  const route = {
    distanceKm: 7.6517,
    durationMinutes: 11.72,
    coordinates: [],
  };
  const controller = new LocationsController(
    { getRoute: async () => route },
    {},
    {
      calculateRouteFare: () => ({
        fareXaf: 3796,
        minimumFareXaf: 1000,
        rates: {
          baseFareXaf: 1000,
          pricePerKilometerXaf: 350,
          pricePerMinuteXaf: 10,
        },
        vehicleOptions: [
          { vehicleType: 'express', fareXaf: 3796 },
          { vehicleType: 'standard', fareXaf: 4296 },
          { vehicleType: 'ousra', fareXaf: 4796 },
        ],
      }),
    },
  );

  assert.deepEqual(await controller.getQuote(request), {
    ...route,
    fareXaf: 3796,
    minimumFareXaf: 1000,
    rates: {
      baseFareXaf: 1000,
      pricePerKilometerXaf: 350,
      pricePerMinuteXaf: 10,
    },
    vehicleOptions: [
      { vehicleType: 'express', fareXaf: 3796 },
      { vehicleType: 'standard', fareXaf: 4296 },
      { vehicleType: 'ousra', fareXaf: 4796 },
    ],
  });
});
