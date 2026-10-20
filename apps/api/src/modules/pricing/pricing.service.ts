import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  calculateFareXaf,
  MINIMUM_FARE_XAF,
  type FareCalculation,
  type FareRates,
} from './pricing-calculator';

@Injectable()
export class PricingService {
  constructor(private readonly config: ConfigService) {}

  calculateFare(calculation: FareCalculation): number {
    return calculateFareXaf(calculation);
  }

  calculateRouteFare(
    distanceKm: number,
    durationMinutes: number,
  ): { fareXaf: number; minimumFareXaf: number; rates: FareRates } {
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

    return { fareXaf, minimumFareXaf: MINIMUM_FARE_XAF, rates };
  }
}
