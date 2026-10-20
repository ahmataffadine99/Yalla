import { getApiHealth } from '../lib/api';

const navigation = [
  { label: 'Vue d’ensemble', current: true },
  { label: 'Chauffeurs', current: false },
  { label: 'Courses', current: false },
  { label: 'Tarification', current: false },
  { label: 'Assistance', current: false },
];

export default async function HomePage() {
  const apiHealth = await getApiHealth();

  return (
    <main className="admin-layout">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Yalla, accueil administration">
          <span className="brand-mark">Y</span>
          <span>
            <strong>Yalla</strong>
            <small>Administration</small>
          </span>
        </a>

        <nav aria-label="Navigation principale">
          <span className="nav-heading">ESPACE DE TRAVAIL</span>
          {navigation.map((item) => (
            <a
              aria-current={item.current ? 'page' : undefined}
              aria-disabled={!item.current}
              className={`nav-item${item.current ? ' active' : ''}${item.current ? '' : ' disabled'}`}
              href={item.current ? '/' : undefined}
              key={item.label}
              tabIndex={item.current ? undefined : -1}
            >
              <span className="nav-indicator" />
              {item.label}
              {!item.current && <span className="coming-soon">Bientôt</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="environment-dot" />
          Environnement local
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Yalla <span>/</span> Vue d’ensemble</div>
          <div className="admin-profile">
            <span className="avatar">A</span>
            <span>Administrateur</span>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">ESPACE D’EXPLOITATION</p>
              <h1>Vue d’ensemble</h1>
              <p className="subtitle">
                Suivez l’état technique de Yalla et retrouvez les outils d’exploitation.
              </p>
            </div>
            <span className="city-badge">
              <span className="city-dot" />
              N’Djamena
            </span>
          </div>

          <section aria-labelledby="system-title" className="section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">SYSTÈME</p>
                <h2 id="system-title">État des services</h2>
              </div>
              <span className="updated-label">Vérifié à l’ouverture de la page</span>
            </div>

            <div className="service-card">
              <div className="service-icon api-icon">API</div>
              <div className="service-copy">
                <h3>API Yalla</h3>
                <p>Serveur utilisé par les interfaces de la plateforme</p>
              </div>
              <div
                className={`service-status${apiHealth.available ? ' is-up' : ' is-down'}`}
                role="status"
              >
                <span />
                {apiHealth.available ? 'Connectée' : 'Indisponible'}
              </div>
            </div>

            <p className="service-note">
              {apiHealth.available
                ? 'La vérification de santé de l’API et de la base de données a réussi.'
                : 'Le tableau de bord ne parvient pas à vérifier l’API. Vérifiez que Docker Compose est démarré.'}
            </p>
          </section>

          <section aria-labelledby="operations-title" className="section operations-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">OUTILS</p>
                <h2 id="operations-title">Opérations Yalla</h2>
              </div>
            </div>

            <div className="empty-state">
              <div className="empty-mark">Y</div>
              <h3>Le socle est prêt</h3>
              <p>
                Les écrans de gestion des chauffeurs et des courses seront ajoutés
                au fur et à mesure que les fonctions correspondantes arrivent dans l’API.
              </p>
            </div>
          </section>

          <footer className="page-footer">
            Yalla <span>·</span> Administration interne <span>·</span> Version de développement
          </footer>
        </div>
      </section>
    </main>
  );
}
