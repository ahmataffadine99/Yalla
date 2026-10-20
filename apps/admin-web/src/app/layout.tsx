import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yalla | Administration',
  description: 'Tableau de bord interne de la plateforme Yalla.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
