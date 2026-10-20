import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PlaceNameDto } from './place-name.dto';

const GEOCODING_TIMEOUT_MS = 5000;
const MINIMUM_REQUEST_INTERVAL_MS = 1000;
const MAX_CACHED_PLACE_NAMES = 1000;

@Injectable()
export class PlaceNameService {
  private readonly cache = new Map<string, string>();
  private requestQueue: Promise<void> = Promise.resolve();
  private lastRequestAt = 0;

  constructor(private readonly config: ConfigService) {}

  async findName(location: PlaceNameDto): Promise<{ label: string }> {
    const baseUrl = this.config.get<string>('PLACE_NAME_BASE_URL');
    if (!baseUrl) {
      throw new ServiceUnavailableException('Place-name provider is not configured');
    }

    const cacheKey = `${location.latitude.toFixed(5)},${location.longitude.toFixed(5)}`;
    const cachedLabel = this.cache.get(cacheKey);
    if (cachedLabel) {
      return { label: cachedLabel };
    }

    const lookup = this.requestQueue.then(async () => {
      const waitTime =
        this.lastRequestAt + MINIMUM_REQUEST_INTERVAL_MS - Date.now();
      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      this.lastRequestAt = Date.now();
      return this.fetchPlaceName(baseUrl, location);
    });
    this.requestQueue = lookup.then(
      () => undefined,
      () => undefined,
    );

    const label = await lookup;
    this.cache.set(cacheKey, label);
    if (this.cache.size > MAX_CACHED_PLACE_NAMES) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    return { label };
  }

  private async fetchPlaceName(
    baseUrl: string,
    location: PlaceNameDto,
  ): Promise<string> {
    const url = new URL('/reverse', baseUrl);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('lat', String(location.latitude));
    url.searchParams.set('lon', String(location.longitude));
    url.searchParams.set('zoom', '18');
    url.searchParams.set('addressdetails', '1');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEOCODING_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'fr',
          'User-Agent': 'Yalla/0.1 (local route preview)',
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new BadGatewayException('Place-name provider returned an error');
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new BadGatewayException(
          'Place-name provider returned invalid JSON',
        );
      }

      const label = getPlaceLabel(payload);
      if (!label) {
        throw new BadGatewayException(
          'Place-name provider returned no place name',
        );
      }
      return label;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }
      if (
        error instanceof TypeError ||
        (error instanceof DOMException && error.name === 'AbortError')
      ) {
        throw new BadGatewayException('Place-name provider request failed');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function getPlaceLabel(payload: unknown): string | null {
  if (!isRecord(payload)) {
    return null;
  }

  const address = isRecord(payload.address) ? payload.address : {};
  const labelParts = [
    address.road,
    address.pedestrian,
    address.path,
    address.neighbourhood,
    address.suburb,
    address.city_district,
    address.city,
    address.town,
    address.village,
  ]
    .filter((part): part is string => typeof part === 'string' && !!part.trim())
    .map((part) => part.trim());
  const uniqueParts = [...new Set(labelParts)];

  if (uniqueParts.length > 0) {
    return uniqueParts.slice(0, 3).join(', ');
  }

  if (typeof payload.name === 'string' && payload.name.trim()) {
    return payload.name.trim();
  }

  if (
    typeof payload.display_name === 'string' &&
    payload.display_name.trim()
  ) {
    return payload.display_name.split(',').slice(0, 3).join(',').trim();
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
