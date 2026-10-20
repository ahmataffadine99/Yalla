import { RoutePreview } from './RoutePreview';

export function HeroSection() {
  return (
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
      <RoutePreview />
    </section>
  );
}
