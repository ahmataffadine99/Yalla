import { Module } from '@nestjs/common';
import { PricingModule } from '../pricing/pricing.module';
import { LocationsController } from './locations.controller';
import { PlaceNameService } from './place-name.service';
import { RoutingService } from './routing.service';

@Module({
  imports: [PricingModule],
  controllers: [LocationsController],
  providers: [PlaceNameService, RoutingService],
  exports: [PlaceNameService, RoutingService],
})
export class LocationsModule {}
