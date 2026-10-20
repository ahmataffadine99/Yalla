import { Injectable } from '@nestjs/common';
import {
  calculateFareXaf,
  type FareCalculation,
} from './pricing-calculator';

@Injectable()
export class PricingService {
  calculateFare(calculation: FareCalculation): number {
    return calculateFareXaf(calculation);
  }
}
