'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  isRouteQuoteSnapshot,
  ROUTE_QUOTE_STORAGE_KEY,
  type RouteQuoteSnapshot,
} from './route-quote';

const vehicleOptions = [
  {
    name: 'Yalla Express',
    description: 'Petite voiture',
    vehicleType: 'express',
  },
  {
    name: 'Yalla Standard',
    description: 'Voiture standard',
    vehicleType: 'standard',
  },
  {
    name: 'Yalla Ousra',
    description: 'Van',
    vehicleType: 'ousra',
  },
] as const;

export function VehicleSelection() {
  const [quote, setQuote] = useState<RouteQuoteSnapshot | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(
    vehicleOptions[0].name,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedQuote = sessionStorage.getItem(ROUTE_QUOTE_STORAGE_KEY);
      if (!storedQuote) {
        setError(
          'Calcule d’abord le prix de ton trajet pour voir les véhicules disponibles.',
        );
        return;
      }

      const parsedQuote: unknown = JSON.parse(storedQuote);
      if (!isRouteQuoteSnapshot(parsedQuote)) {
        setError(
          'Cette estimation est invalide. Retourne à la carte pour recalculer le prix.',
        );
        return;
      }

      setQuote(parsedQuote);
    } catch {
      setError(
        'Impossible de lire cette estimation. Retourne à la carte pour recalculer le prix.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <main className="offers-page">
      <Link className="auth-brand" href="/">
        <span className="brand-mark">Y</span>
        yalla
      </Link>
      <section aria-labelledby="offers-title" className="offers-card">
        <p className="eyebrow">VOTRE TRAJET À N’DJAMENA</p>
        <h1 id="offers-title">Choisissez votre véhicule</h1>
        <p className="offers-description">
          Sélectionnez l’option qui correspond à votre trajet.
        </p>

        {isLoading ? (
          <p aria-live="polite" className="offers-message">
            Chargement de votre estimation…
          </p>
        ) : error ? (
          <p aria-live="assertive" className="auth-error">
            {error}
          </p>
        ) : quote ? (
          <>
            <div className="offers-route">
              <div>
                <small>DÉPART</small>
                <strong>{quote.originLabel}</strong>
              </div>
              <div>
                <small>ARRIVÉE</small>
                <strong>{quote.destinationLabel}</strong>
              </div>
              <p>
                {quote.distanceKm.toFixed(2)} km · environ{' '}
                {quote.durationMinutes.toFixed(0)} min
              </p>
            </div>
            <div aria-label="Options de véhicule" className="vehicle-options">
              {vehicleOptions.map((vehicle) => {
                const isSelected = selectedVehicle === vehicle.name;
                const fareXaf = quote.vehicleOptions.find(
                  (option) => option.vehicleType === vehicle.vehicleType,
                )?.fareXaf;

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`vehicle-option${isSelected ? ' is-selected' : ''}`}
                    key={vehicle.name}
                    onClick={() => setSelectedVehicle(vehicle.name)}
                    type="button"
                  >
                    <span className="vehicle-option-copy">
                      <strong>{vehicle.name}</strong>
                      <small>{vehicle.description}</small>
                    </span>
                    <span className="vehicle-option-price">
                      {typeof fareXaf === 'number'
                        ? `${fareXaf.toLocaleString('fr-FR')} FCFA`
                        : 'Tarif indisponible'}
                      {isSelected && <small>Choisi</small>}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="offers-notice">
              Prix indicatifs : le tarif de Yalla Standard comprend un
              supplément de 500 FCFA et celui de Yalla Ousra de 1 000 FCFA.
              La réservation en ligne sera disponible prochainement.
            </p>
          </>
        ) : null}

        <Link className="offers-back" href="/">
          Retour à la carte
        </Link>
      </section>
    </main>
  );
}
