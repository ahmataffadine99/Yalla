export function CitySection() {
  return (
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
  );
}
