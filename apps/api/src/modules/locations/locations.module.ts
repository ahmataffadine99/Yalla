import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { PlaceNameService } from './place-name.service';
import { RoutingService } from './routing.service';

@Module({
  controllers: [LocationsController],
  providers: [PlaceNameService, RoutingService],
  exports: [PlaceNameService, RoutingService],
})
export class LocationsModule {}
