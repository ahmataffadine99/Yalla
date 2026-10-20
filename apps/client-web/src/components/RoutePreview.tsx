'use client';

import { useEffect, useRef, useState } from 'react';
import type { CircleMarker, Map, Polyline } from 'leaflet';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RoadRoute = {
  distanceKm: number;
  durationMinutes: number;
  coordinates: Coordinates[];
};

type RouteApiResponse = RoadRoute;

type PlaceNameResponse = {
  label: string;
};

type PointSelection = 'origin' | 'destination';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export function RoutePreview() {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const originMarkerRef = useRef<CircleMarker | null>(null);
  const destinationMarkerRef = useRef<CircleMarker | null>(null);
  const routeLineRef = useRef<Polyline | null>(null);
  const pointSelectionRef = useRef<PointSelection>('origin');
  const placeNameRequestRef = useRef({ origin: 0, destination: 0 });
  const [mapReady, setMapReady] = useState(false);
  const [pointSelection, setPointSelection] =
    useState<PointSelection>('origin');
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [originLabel, setOriginLabel] = useState('Choisissez un point sur la carte');
  const [destinationLabel, setDestinationLabel] = useState(
    'Choisissez un point sur la carte',
  );
  const [route, setRoute] = useState<RoadRoute | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  pointSelectionRef.current = pointSelection;

  useEffect(() => {
    let isMounted = true;

    void import('leaflet').then((leaflet) => {
      if (!isMounted || !mapElementRef.current) {
        return;
      }

      const map = leaflet
        .map(mapElementRef.current)
        .setView([12.11, 15.04], 13);

      leaflet
        .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })
        .addTo(map);

      map.on('click', (event) => {
        const point = {
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        };

        if (pointSelectionRef.current === 'origin') {
          setOrigin(point);
          setOriginLabel('Recherche du lieu…');
          void lookupPlaceName(point, 'origin');
          setPointSelection('destination');
        } else {
          setDestination(point);
          setDestinationLabel('Recherche du lieu…');
          void lookupPlaceName(point, 'destination');
        }

        setRoute(null);
        setError(null);
      });

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    void import('leaflet').then((leaflet) => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      originMarkerRef.current?.remove();
      destinationMarkerRef.current?.remove();
      routeLineRef.current?.remove();

      originMarkerRef.current = origin
        ? leaflet
            .circleMarker([origin.latitude, origin.longitude], {
              color: '#fff',
              fillColor: '#1e7655',
              fillOpacity: 1,
              radius: 8,
              weight: 3,
            })
            .bindPopup('Départ')
            .addTo(map)
        : null;

      destinationMarkerRef.current = destination
        ? leaflet
            .circleMarker(
              [destination.latitude, destination.longitude],
              {
                color: '#fff',
                fillColor: '#e69254',
                fillOpacity: 1,
                radius: 8,
                weight: 3,
              },
            )
            .bindPopup('Arrivée')
            .addTo(map)
        : null;

      routeLineRef.current =
        route && route.coordinates.length > 1
          ? leaflet
              .polyline(
                route.coordinates.map((point) => [
                  point.latitude,
                  point.longitude,
                ]),
                { color: '#1e7655', weight: 5, opacity: 0.8 },
              )
              .addTo(map)
          : null;

      if (routeLineRef.current) {
        map.fitBounds(routeLineRef.current.getBounds(), { padding: [30, 30] });
      } else if (origin && destination) {
        map.fitBounds(
          [
            [origin.latitude, origin.longitude],
            [destination.latitude, destination.longitude],
          ],
          { padding: [30, 30] },
        );
      } else if (origin) {
        map.setView([origin.latitude, origin.longitude], 14);
      } else if (destination) {
        map.setView([destination.latitude, destination.longitude], 14);
      }
    });
  }, [destination, mapReady, origin, route]);

  async function lookupPlaceName(
    point: Coordinates,
    selection: PointSelection,
  ) {
    const requestId = ++placeNameRequestRef.current[selection];

    try {
      const response = await fetch(`${API_BASE_URL}/locations/place-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(point),
      });
      if (!response.ok) {
        throw new Error('Place name could not be resolved');
      }

      const result = (await response.json()) as PlaceNameResponse;
      if (requestId !== placeNameRequestRef.current[selection]) {
        return;
      }

      if (selection === 'origin') {
        setOriginLabel(result.label);
      } else {
        setDestinationLabel(result.label);
      }
    } catch {
      if (requestId !== placeNameRequestRef.current[selection]) {
        return;
      }

      if (selection === 'origin') {
        setOriginLabel('Lieu non identifié');
      } else {
        setDestinationLabel('Lieu non identifié');
      }
    }
  }

  async function calculateRoute() {
    if (!origin || !destination) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoute(null);

    try {
      const response = await fetch(`${API_BASE_URL}/locations/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLatitude: origin.latitude,
          originLongitude: origin.longitude,
          destinationLatitude: destination.latitude,
          destinationLongitude: destination.longitude,
        }),
      });

      const result = (await response.json()) as RouteApiResponse;
      if (!response.ok) {
        throw new Error(
          'Impossible de calculer cet itinéraire. Vérifiez les points et réessayez.',
        );
      }

      setRoute(result);
    } catch (routeError) {
      setError(
        routeError instanceof Error
          ? routeError.message
          : 'Impossible de calculer le trajet pour le moment.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="route-card">
      <div
        aria-label="Carte interactive de N'Djamena"
        className="route-map"
        ref={mapElementRef}
      />
      <div className="route-summary">
        <p className="map-instruction">
          Cliquez sur la carte pour placer les points de départ et d’arrivée.
        </p>
        <div aria-label="Point à placer" className="route-location-choice">
          <button
            aria-pressed={pointSelection === 'origin'}
            className={pointSelection === 'origin' ? 'is-selected' : ''}
            onClick={() => setPointSelection('origin')}
            type="button"
          >
            Choisir le départ
          </button>
          <button
            aria-pressed={pointSelection === 'destination'}
            className={
              pointSelection === 'destination' ? 'is-selected' : ''
            }
            onClick={() => setPointSelection('destination')}
            type="button"
          >
            Choisir l’arrivée
          </button>
        </div>
        <div className="route-point">
          <span className="point-dot pickup-dot" />
          <div>
            <small>VOTRE DÉPART</small>
            <strong>{originLabel}</strong>
          </div>
        </div>
        <span aria-hidden="true" className="route-divider" />
        <div className="route-point">
          <span className="point-dot destination-dot" />
          <div>
            <small>VOTRE ARRIVÉE</small>
            <strong>{destinationLabel}</strong>
          </div>
        </div>
        <button
          className="route-submit"
          disabled={!origin || !destination || isLoading}
          onClick={calculateRoute}
          type="button"
        >
          {isLoading ? 'Calcul du trajet…' : 'Afficher le trajet'}
        </button>
        {route && (
          <p aria-live="polite" className="route-result">
            <strong>{route.distanceKm.toFixed(2)} km</strong>
            <span>
              Environ {route.durationMinutes.toFixed(0)} min, hors trafic.
            </span>
          </p>
        )}
        {error && (
          <p aria-live="assertive" className="route-error">
            {error}
          </p>
        )}
        <p className="booking-notice">
          Les points choisis sont transmis à OpenStreetMap pour nommer les
          lieux. Estimation hors trafic ; réservation bientôt disponible.
        </p>
      </div>
    </div>
  );
}
