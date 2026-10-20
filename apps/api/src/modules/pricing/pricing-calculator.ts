export const MINIMUM_FARE_XAF = 1000;

export type FareRates = {
  baseFareXaf: number;
  pricePerKilometerXaf: number;
  pricePerMinuteXaf: number;
};

export type FareCalculation = {
  distanceKm: number;
  durationMinutes: number;
  surchargesXaf: number[];
  rates: FareRates;
};

export function calculateFareXaf(calculation: FareCalculation): number {
  validateNonNegativeFinite(calculation.distanceKm, 'distanceKm');
  validateNonNegativeFinite(calculation.durationMinutes, 'durationMinutes');
  validateNonNegativeInteger(calculation.rates.baseFareXaf, 'baseFareXaf');
  validateNonNegativeInteger(
    calculation.rates.pricePerKilometerXaf,
    'pricePerKilometerXaf',
  );
  validateNonNegativeInteger(
    calculation.rates.pricePerMinuteXaf,
    'pricePerMinuteXaf',
  );

  if (!Array.isArray(calculation.surchargesXaf)) {
    throw new TypeError('surchargesXaf must be an array');
  }

  const surchargesXaf = calculation.surchargesXaf.reduce((sum, surcharge) => {
    validateNonNegativeInteger(surcharge, 'surcharge');
    return sum + surcharge;
  }, 0);

  const fare =
    calculation.rates.baseFareXaf +
    calculation.distanceKm * calculation.rates.pricePerKilometerXaf +
    calculation.durationMinutes * calculation.rates.pricePerMinuteXaf +
    surchargesXaf;

  if (!Number.isFinite(fare)) {
    throw new RangeError('Calculated fare must be finite');
  }

  // Arrondir vers le haut évite de sous-facturer une fraction de FCFA.
  const roundedFare = Math.ceil(fare);
  if (!Number.isSafeInteger(roundedFare)) {
    throw new RangeError('Calculated fare exceeds the safe XAF range');
  }

  return Math.max(MINIMUM_FARE_XAF, roundedFare);
}

function validateNonNegativeFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite non-negative number`);
  }
}

function validateNonNegativeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer`);
  }
}
