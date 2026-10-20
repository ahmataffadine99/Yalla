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
    title: 'Consultez votre estimation',
    description: 'Le prix sera affiché avant la confirmation de votre demande.',
  },
  {
    number: '03',
    title: 'Retrouvez votre chauffeur',
    description: 'Suivez les étapes de votre course depuis votre téléphone.',
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
