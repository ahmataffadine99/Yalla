import { Body, Controller, Post } from '@nestjs/common';
import { PlaceNameDto } from './place-name.dto';
import { PlaceNameService } from './place-name.service';
import { RouteRequestDto } from './route-request.dto';
import { RoutingService } from './routing.service';

@Controller('locations')
export class LocationsController {
  constructor(
    private readonly routing: RoutingService,
    private readonly placeNames: PlaceNameService,
  ) {}

  @Post('route')
  getRoute(@Body() request: RouteRequestDto) {
    return this.routing.getRoute(request);
  }

  @Post('place-name')
  getPlaceName(@Body() location: PlaceNameDto) {
    return this.placeNames.findName(location);
  }
}
