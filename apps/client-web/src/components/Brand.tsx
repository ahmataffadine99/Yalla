type BrandProps = {
  footer?: boolean;
};

export function Brand({ footer = false }: BrandProps) {
  return (
    <a
      aria-label="Yalla, accueil"
      className={`brand${footer ? ' footer-brand' : ''}`}
      href="#"
    >
      <span aria-hidden="true" className="brand-mark">Y</span>
      <span>yalla</span>
    </a>
  );
}
