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

type Passenger = 'me' | 'someone-else';

export function VehicleSelection() {
  const [quote, setQuote] = useState<RouteQuoteSnapshot | null>(null);
  const [selectedVehicle, setSelectedVehicle] =
    useState<(typeof vehicleOptions)[number]['vehicleType']>('express');
  const [passenger, setPassenger] = useState<Passenger>('me');
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
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
        <h1 id="offers-title">Choisissez une course</h1>
        <p className="offers-description">
          Comparez les options disponibles pour ce trajet.
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
              <div className="offers-route-heading">
                <strong>Votre trajet</strong>
                <Link href="/">Modifier</Link>
              </div>
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
            <fieldset className="passenger-picker">
              <legend>Pour qui commandez-vous ?</legend>
              <label
                className={`passenger-choice${passenger === 'me' ? ' is-selected' : ''}`}
              >
                <input
                  checked={passenger === 'me'}
                  name="passenger"
                  onChange={() => setPassenger('me')}
                  type="radio"
                  value="me"
                />
                <span>Pour moi</span>
              </label>
              <label
                className={`passenger-choice${passenger === 'someone-else' ? ' is-selected' : ''}`}
              >
                <input
                  checked={passenger === 'someone-else'}
                  name="passenger"
                  onChange={() => setPassenger('someone-else')}
                  type="radio"
                  value="someone-else"
                />
                <span>Pour quelqu’un d’autre</span>
              </label>
              {passenger === 'someone-else' && (
                <div className="passenger-fields">
                  <label>
                    Nom du passager
                    <input
                      autoComplete="name"
                      onChange={(event) => setPassengerName(event.target.value)}
                      placeholder="Prénom et nom"
                      required
                      value={passengerName}
                    />
                  </label>
                  <label>
                    Téléphone du passager
                    <input
                      autoComplete="tel"
                      onChange={(event) => setPassengerPhone(event.target.value)}
                      placeholder="+235…"
                      pattern="^\+[1-9]\d{7,14}$"
                      required
                      type="tel"
                      value={passengerPhone}
                    />
                    <small>
                      Numéro au format international, pour que le chauffeur
                      puisse le joindre.
                    </small>
                  </label>
                </div>
              )}
            </fieldset>
            <div aria-label="Options de véhicule" className="vehicle-options">
              {vehicleOptions.map((vehicle) => {
                const isSelected = selectedVehicle === vehicle.vehicleType;
                const fareXaf = quote.vehicleOptions.find(
                  (option) => option.vehicleType === vehicle.vehicleType,
                )?.fareXaf;

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`vehicle-option${isSelected ? ' is-selected' : ''}`}
                    key={vehicle.name}
                    onClick={() => setSelectedVehicle(vehicle.vehicleType)}
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
            {quote.vehicleOptions.map((option) =>
              option.vehicleType === selectedVehicle ? (
                <div className="selected-trip-summary" key={option.vehicleType}>
                  <span>
                    <strong>
                      {vehicleOptions.find(
                        (vehicle) => vehicle.vehicleType === option.vehicleType,
                      )?.name}
                    </strong>
                    <small>
                      {passenger === 'me'
                        ? 'Passager : vous'
                        : `Passager : ${passengerName.trim() || 'à préciser'}`}
                    </small>
                  </span>
                  <strong>{option.fareXaf.toLocaleString('fr-FR')} FCFA</strong>
                </div>
              ) : null,
            )}
            <p className="offers-notice">
              Prix indicatifs : le tarif de Yalla Standard comprend un
              supplément de 500 FCFA et celui de Yalla Ousra de 1 000 FCFA.
              La commande sera activée lorsque le service de réservation sera
              prêt.
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
