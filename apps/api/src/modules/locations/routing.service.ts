import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RouteRequestDto } from './route-request.dto';

const ROUTING_TIMEOUT_MS = 5000;

export type RoadRoute = {
  distanceMeters: number;
  durationSeconds: number;
  distanceKm: number;
  durationMinutes: number;
  coordinates: Array<{ latitude: number; longitude: number }>;
};

@Injectable()
export class RoutingService {
  constructor(private readonly config: ConfigService) {}

  async getRoute(request: RouteRequestDto): Promise<RoadRoute> {
    const baseUrl = this.config.get<string>('ROUTING_BASE_URL');
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'Routing provider is not configured',
      );
    }

    const url = new URL(
      `/route/v1/driving/${request.originLongitude},${request.originLatitude};${request.destinationLongitude},${request.destinationLatitude}`,
      baseUrl,
    );
    url.searchParams.set('overview', 'full');
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('steps', 'false');

    const response = await this.fetchRoute(url);
    if (!response.ok) {
      throw new BadGatewayException('Routing provider returned an error');
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new BadGatewayException('Routing provider returned invalid JSON');
    }

    if (!isRecord(payload) || payload.code !== 'Ok') {
      throw new BadGatewayException('Routing provider returned no valid route');
    }

    const route = Array.isArray(payload.routes) ? payload.routes[0] : undefined;
    const geometry =
      isRecord(route) && isRecord(route.geometry)
        ? route.geometry.coordinates
        : undefined;
    if (
      !isRecord(route) ||
      typeof route.distance !== 'number' ||
      !Number.isFinite(route.distance) ||
      route.distance < 0 ||
      typeof route.duration !== 'number' ||
      !Number.isFinite(route.duration) ||
      route.duration < 0
    ) {
      throw new BadGatewayException('Routing provider returned no valid route');
    }

    if (
      !Array.isArray(geometry) ||
      geometry.length < 2 ||
      !geometry.every(
        (coordinate) =>
          Array.isArray(coordinate) &&
          coordinate.length >= 2 &&
          typeof coordinate[0] === 'number' &&
          Number.isFinite(coordinate[0]) &&
          coordinate[0] >= -180 &&
          coordinate[0] <= 180 &&
          typeof coordinate[1] === 'number' &&
          Number.isFinite(coordinate[1]) &&
          coordinate[1] >= -90 &&
          coordinate[1] <= 90,
      )
    ) {
      throw new BadGatewayException('Routing provider returned invalid geometry');
    }

    return {
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      distanceKm: route.distance / 1000,
      durationMinutes: route.duration / 60,
      coordinates: geometry.map(([longitude, latitude]) => ({
        latitude,
        longitude,
      })),
    };
  }

  private async fetchRoute(url: URL): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ROUTING_TIMEOUT_MS);

    try {
      return await fetch(url, { signal: controller.signal });
    } catch (error) {
      if (
        error instanceof TypeError ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        throw new BadGatewayException('Routing provider request failed');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
