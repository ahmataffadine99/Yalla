import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yalla | Vos trajets à N’Djamena',
  description:
    'Yalla prépare un service de transport simple et sûr pour vos déplacements à N’Djamena.',
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
