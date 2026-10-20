'use client';

import Link from 'next/link';
import { useState } from 'react';

type EmailConfirmationProps = { token?: string };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export function EmailConfirmation({ token }: EmailConfirmationProps) {
  const [message, setMessage] = useState<string | null>(
    token ? null : 'Lien de confirmation manquant.',
  );
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function confirmEmail() {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/email/verification/check`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        },
      );
      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message ?? 'Le lien est invalide ou expiré.');
      }
      setIsVerified(true);
      setMessage('Ton adresse e-mail est confirmée. Tu peux te connecter.');
    } catch (confirmationError) {
      setMessage(
        confirmationError instanceof Error
          ? confirmationError.message
          : 'Impossible de confirmer cette adresse e-mail.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section aria-labelledby="confirmation-title" className="auth-card">
        <Link className="auth-brand" href="/">
          <span className="brand-mark">Y</span>
          yalla
        </Link>
        <p className="eyebrow">CONFIRMATION DU COMPTE</p>
        <h1 id="confirmation-title">Adresse e-mail</h1>
        <p
          aria-live="polite"
          className={message && !isVerified ? 'auth-error' : 'auth-description'}
        >
          {isLoading
            ? 'Vérification en cours…'
            : message ?? 'Confirme ton adresse e-mail pour activer ton compte.'}
        </p>
        {!isLoading && isVerified && (
          <Link className="auth-submit auth-button-link" href="/connexion">
            Se connecter
          </Link>
        )}
        {!isLoading && !isVerified && token && (
          <button
            className="auth-submit"
            disabled={isLoading}
            onClick={confirmEmail}
            type="button"
          >
            Confirmer mon adresse e-mail
          </button>
        )}
        {!isLoading && !token && (
          <Link className="auth-submit auth-button-link" href="/inscription">
            Retour à l’inscription
          </Link>
        )}
      </section>
    </main>
  );
}
