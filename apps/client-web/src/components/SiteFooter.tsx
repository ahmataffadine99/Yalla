import { Brand } from './Brand';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Brand footer />
      <p>Le mouvement nous rapproche.</p>
      <span className="footer-location">N’Djamena, Tchad</span>
    </footer>
  );
}
