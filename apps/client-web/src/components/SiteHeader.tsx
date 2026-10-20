import { Brand } from './Brand';

export function SiteHeader() {
  return (
    <header className="site-header">
      <Brand />
      <nav aria-label="Navigation principale" className="main-nav">
        <a href="#fonctionnement">Comment ça marche</a>
        <a href="#ndjamena">N’Djamena</a>
      </nav>
      <a className="header-link" href="/inscription">
        Créer un compte
        <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
