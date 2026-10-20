type Step = {
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: '01',
    title: 'Indiquez votre trajet',
    description: 'Choisissez votre point de départ et votre destination.',
  },
  {
    number: '02',
    title: 'Choisissez votre véhicule',
    description: 'Comparez les prix de Yalla Express, Standard et Ousra.',
  },
  {
    number: '03',
    title: 'Réservez votre trajet',
    description: 'La réservation en ligne sera bientôt disponible.',
  },
];

function StepCard({ number, title, description }: Step) {
  return (
    <article className="step-card">
      <span className="step-number">{number}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export function StepsSection() {
  return (
    <section aria-labelledby="steps-title" className="steps-section" id="fonctionnement">
      <div className="section-intro">
        <p className="eyebrow">SIMPLE, DU DÉPART À L’ARRIVÉE</p>
        <h2 id="steps-title">Votre trajet, en trois étapes.</h2>
        <p>Un parcours familier, adapté à la réalité de notre ville.</p>
      </div>
      <div className="steps-grid">
        {steps.map((step) => <StepCard key={step.number} {...step} />)}
      </div>
    </section>
  );
}
