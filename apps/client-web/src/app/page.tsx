const steps = [
  {
    number: '01',
    title: 'Indiquez votre trajet',
    description: 'Choisissez votre point de départ et votre destination.',
  },
  {
    number: '02',
    title: 'Consultez votre estimation',
    description: 'Le prix sera affiché avant la confirmation de votre demande.',
  },
  {
    number: '03',
    title: 'Retrouvez votre chauffeur',
    description: 'Suivez les étapes de votre course depuis votre téléphone.',
  },
];

export default function HomePage() {
  return (
    <main>
      <header className="site-header">
        <a aria-label="Yalla, accueil" className="brand" href="#">
          <span className="brand-mark">Y</span>
          <span>yalla</span>
        </a>
        <nav aria-label="Navigation principale" className="main-nav">
          <a href="#fonctionnement">Comment ça marche</a>
          <a href="#ndjamena">N’Djamena</a>
        </nav>
        <a className="header-link" href="#demarrer">
          Bientôt disponible
          <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section aria-labelledby="hero-title" className="hero" id="demarrer">
        <div className="hero-copy">
          <p className="eyebrow"><span /> N’DJAMENA, ON ARRIVE</p>
          <h1 id="hero-title">
            La ville bouge.
            <br />
            <span>Yalla vous emmène.</span>
          </h1>
          <p className="hero-description">
            Un trajet, un chauffeur, un prix annoncé avant de partir. Nous
            préparons une nouvelle façon de se déplacer à N’Djamena.
          </p>
          <a className="primary-link" href="#fonctionnement">
            Découvrir le service <span aria-hidden="true">↓</span>
          </a>
          <div className="trust-note">
            <span aria-hidden="true" className="trust-icon">N</span>
            <p>
              <strong>Pensé pour N’Djamena</strong>
              <span>Les trajets du quotidien, avec des repères d’ici.</span>
            </p>
          </div>
        </div>

        <div aria-label="Illustration de trajet à N’Djamena" className="route-card">
          {/* Schéma décoratif : ce n'est ni une carte ni un itinéraire réel. */}
          <div className="map-art" aria-hidden="true">
            <span className="road road-one" />
            <span className="road road-two" />
            <span className="road road-three" />
            <span className="road road-four" />
            <span className="route-line" />
            <span className="map-label label-one">N’DJAMENA</span>
            <span className="map-label label-two">N’DJAMENA</span>
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
      </section>

      <section aria-labelledby="steps-title" className="steps-section" id="fonctionnement">
        <div className="section-intro">
          <p className="eyebrow">SIMPLE, DU DÉPART À L’ARRIVÉE</p>
          <h2 id="steps-title">Votre trajet, en trois étapes.</h2>
          <p>Un parcours familier, adapté à la réalité de notre ville.</p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="city-title" className="city-section" id="ndjamena">
        <div>
          <p className="eyebrow">PREMIÈRE ÉTAPE</p>
          <h2 id="city-title">N’Djamena d’abord.</h2>
          <p>
            Nous commençons dans la capitale pour construire le service avec
            celles et ceux qui connaissent ses routes, ses quartiers et ses
            habitudes.
          </p>
        </div>
        <div className="city-stamp" aria-label="Lancement prévu à N’Djamena">
          <span className="stamp-star" aria-hidden="true">N</span>
          <span>ICI, CHEZ NOUS</span>
          <strong>N’DJAMENA</strong>
          <small>La suite se construit ensemble</small>
        </div>
      </section>

      <footer className="site-footer">
        <a aria-label="Yalla, accueil" className="brand footer-brand" href="#">
          <span className="brand-mark">Y</span>
          <span>yalla</span>
        </a>
        <p>Le mouvement nous rapproche.</p>
        <span className="footer-location">N’Djamena, Tchad</span>
      </footer>
    </main>
  );
}
