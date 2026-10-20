import { Body, Controller, Post } from '@nestjs/common';
import { RouteRequestDto } from './route-request.dto';
import { RoutingService } from './routing.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly routing: RoutingService) {}

  @Post('route')
  getRoute(@Body() request: RouteRequestDto) {
    return this.routing.getRoute(request);
  }
}
