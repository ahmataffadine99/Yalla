const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  calculateFareXaf,
  MINIMUM_FARE_XAF,
} = require('../dist/modules/pricing/pricing-calculator');

const rates = {
  baseFareXaf: 500,
  pricePerKilometerXaf: 200,
  pricePerMinuteXaf: 50,
};

test('applies the minimum fare to short trips', () => {
  assert.equal(
    calculateFareXaf({
      distanceKm: 1,
      durationMinutes: 2,
      surchargesXaf: [],
      rates,
    }),
    MINIMUM_FARE_XAF,
  );
});

test('adds base, distance, duration, and fixed surcharges', () => {
  assert.equal(
    calculateFareXaf({
      distanceKm: 10,
      durationMinutes: 20,
      surchargesXaf: [100, 50],
      rates,
    }),
    3650,
  );
});

test('rounds the calculated total up to a whole XAF', () => {
  assert.equal(
    calculateFareXaf({
      distanceKm: 12.345,
      durationMinutes: 0,
      surchargesXaf: [],
      rates: {
        baseFareXaf: 1000,
        pricePerKilometerXaf: 100,
        pricePerMinuteXaf: 0,
      },
    }),
    2235,
  );
});

test('rejects negative or non-finite trip measurements', () => {
  for (const distanceKm of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () =>
        calculateFareXaf({
          distanceKm,
          durationMinutes: 1,
          surchargesXaf: [],
          rates,
        }),
      RangeError,
    );
  }
});

test('rejects invalid rates and surcharges', () => {
  assert.throws(
    () =>
      calculateFareXaf({
        distanceKm: 1,
        durationMinutes: 1,
        surchargesXaf: [-1],
        rates,
      }),
    RangeError,
  );

  assert.throws(
    () =>
      calculateFareXaf({
        distanceKm: 1,
        durationMinutes: 1,
        surchargesXaf: [],
        rates: { ...rates, pricePerMinuteXaf: 1.5 },
      }),
    RangeError,
  );
});

test('rejects a fare that exceeds the safe integer range', () => {
  assert.throws(
    () =>
      calculateFareXaf({
        distanceKm: Number.MAX_SAFE_INTEGER + 1,
        durationMinutes: 1,
        surchargesXaf: [],
        rates: {
          baseFareXaf: 0,
          pricePerKilometerXaf: 1,
          pricePerMinuteXaf: 0,
        },
      }),
    RangeError,
  );
});
