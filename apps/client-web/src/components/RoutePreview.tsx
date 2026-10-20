export function RoutePreview() {
  return (
    <div aria-label="Illustration d'un trajet, non basée sur une carte réelle" className="route-card">
      {/* Illustration CSS uniquement : les vraies cartes et itinéraires viendront après validation des données locales. */}
      <div className="map-art" aria-hidden="true">
        <span className="road road-one" />
        <span className="road road-two" />
        <span className="road road-three" />
        <span className="road road-four" />
        <span className="route-line" />
        <span className="map-label label-one">TRAJET ILLUSTRATIF</span>
        <span className="map-pin pickup-pin"><i /></span>
        <span className="map-pin dropoff-pin"><i /></span>
        <span className="map-caption">Un trajet à votre rythme</span>
      </div>
      <div className="route-summary">
        <div className="route-point">
          <span className="point-dot pickup-dot" />
          <div><small>VOTRE DÉPART</small><strong>Votre position</strong></div>
        </div>
        <span aria-hidden="true" className="route-divider" />
        <div className="route-point">
          <span className="point-dot destination-dot" />
          <div><small>VOTRE ARRIVÉE</small><strong>Votre destination</strong></div>
        </div>
        <p className="booking-notice">
          La réservation en ligne sera activée dans une prochaine étape.
        </p>
      </div>
    </div>
  );
}
