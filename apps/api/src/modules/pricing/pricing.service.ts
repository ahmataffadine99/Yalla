import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  calculateFareXaf,
  MINIMUM_FARE_XAF,
  type FareCalculation,
  type FareRates,
} from './pricing-calculator';

const vehicleSurcharges = [
  { vehicleType: 'express', surchargeXaf: 0 },
  { vehicleType: 'standard', surchargeXaf: 500 },
  { vehicleType: 'ousra', surchargeXaf: 1000 },
] as const;

@Injectable()
export class PricingService {
  constructor(private readonly config: ConfigService) {}

  calculateFare(calculation: FareCalculation): number {
    return calculateFareXaf(calculation);
  }

  calculateRouteFare(
    distanceKm: number,
    durationMinutes: number,
  ): {
    fareXaf: number;
    minimumFareXaf: number;
    rates: FareRates;
    vehicleOptions: {
      vehicleType: (typeof vehicleSurcharges)[number]['vehicleType'];
      fareXaf: number;
    }[];
  } {
    const rates = {
      baseFareXaf: this.config.getOrThrow<number>('FARE_BASE_XAF'),
      pricePerKilometerXaf: this.config.getOrThrow<number>(
        'FARE_PRICE_PER_KILOMETER_XAF',
      ),
      pricePerMinuteXaf: this.config.getOrThrow<number>(
        'FARE_PRICE_PER_MINUTE_XAF',
      ),
    };

    const fareXaf = this.calculateFare({
      distanceKm,
      durationMinutes,
      surchargesXaf: [],
      rates,
    });

    return {
      fareXaf,
      minimumFareXaf: MINIMUM_FARE_XAF,
      rates,
      vehicleOptions: vehicleSurcharges.map(({ vehicleType, surchargeXaf }) => ({
        vehicleType,
        fareXaf: fareXaf + surchargeXaf,
      })),
    };
  }
}
