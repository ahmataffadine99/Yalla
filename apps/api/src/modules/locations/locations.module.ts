import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { RoutingService } from './routing.service';

@Module({
  controllers: [LocationsController],
  providers: [RoutingService],
  exports: [RoutingService],
})
export class LocationsModule {}
