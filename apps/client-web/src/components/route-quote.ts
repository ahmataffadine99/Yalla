export const ROUTE_QUOTE_STORAGE_KEY = 'yalla-route-quote';

export type VehicleType = 'express' | 'standard' | 'ousra';

export type RouteQuoteSnapshot = {
  originLabel: string;
  destinationLabel: string;
  distanceKm: number;
  durationMinutes: number;
  fareXaf: number;
  vehicleOptions: {
    vehicleType: VehicleType;
    fareXaf: number;
  }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isVehicleQuoteOption(
  value: unknown,
): value is RouteQuoteSnapshot['vehicleOptions'][number] {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.vehicleType === 'express' ||
      value.vehicleType === 'standard' ||
      value.vehicleType === 'ousra') &&
    typeof value.fareXaf === 'number' &&
    Number.isSafeInteger(value.fareXaf) &&
    value.fareXaf >= 0
  );
}

function hasAllVehicleOptions(value: unknown): value is RouteQuoteSnapshot['vehicleOptions'] {
  if (
    !Array.isArray(value) ||
    value.length !== 3 ||
    !value.every(isVehicleQuoteOption)
  ) {
    return false;
  }

  return new Set(value.map((option) => option.vehicleType)).size === 3;
}

export function isRouteQuoteSnapshot(
  value: unknown,
): value is RouteQuoteSnapshot {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.originLabel === 'string' &&
    typeof value.destinationLabel === 'string' &&
    typeof value.distanceKm === 'number' &&
    Number.isFinite(value.distanceKm) &&
    typeof value.durationMinutes === 'number' &&
    Number.isFinite(value.durationMinutes) &&
    typeof value.fareXaf === 'number' &&
    Number.isSafeInteger(value.fareXaf) &&
    value.fareXaf >= 0 &&
    hasAllVehicleOptions(value.vehicleOptions)
  );
}
