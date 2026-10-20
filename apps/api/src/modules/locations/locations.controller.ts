import { Body, Controller, Post } from '@nestjs/common';
import { PricingService } from '../pricing/pricing.service';
import { PlaceNameDto } from './place-name.dto';
import { PlaceNameService } from './place-name.service';
import { RouteRequestDto } from './route-request.dto';
import { RoutingService } from './routing.service';

@Controller('locations')
export class LocationsController {
  constructor(
    private readonly routing: RoutingService,
    private readonly placeNames: PlaceNameService,
    private readonly pricing: PricingService,
  ) {}

  @Post('route')
  getRoute(@Body() request: RouteRequestDto) {
    return this.routing.getRoute(request);
  }

  @Post('quote')
  async getQuote(@Body() request: RouteRequestDto) {
    const route = await this.routing.getRoute(request);
    const price = this.pricing.calculateRouteFare(
      route.distanceKm,
      route.durationMinutes,
    );

    return { ...route, ...price };
  }

  @Post('place-name')
  getPlaceName(@Body() location: PlaceNameDto) {
    return this.placeNames.findName(location);
  }
}
