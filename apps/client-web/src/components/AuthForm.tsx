'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type AuthFormProps = {
  mode: 'register' | 'login';
};

type ApiMessage = { message?: unknown };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === 'register';
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (isRegister && password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/${isRegister ? 'register' : 'login'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isRegister
              ? { email, phoneNumber, password }
              : { email, password },
          ),
        },
      );
      const result = (await response.json()) as ApiMessage & {
        accessToken?: string;
      };

      if (!response.ok) {
        throw new Error(
          readApiMessage(result, 'Une erreur est survenue.'),
        );
      }

      if (isRegister) {
        setMessage(
          readApiMessage(
            result,
            'Vérifie ta boîte e-mail pour confirmer ton adresse.',
          ),
        );
        return;
      }

      if (!result.accessToken) {
        throw new Error('La connexion a réussi sans jeton de session.');
      }
      window.sessionStorage.setItem('yalla-access-token', result.accessToken);
      setMessage('Connexion réussie. Ton compte est prêt pour la suite.');
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? getUserFacingAuthError(requestError.message)
          : 'Impossible de contacter le service. Réessaie.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function resendVerification() {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/email/verification/resend`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );
      const result = (await response.json()) as ApiMessage;
      if (!response.ok) {
        throw new Error(readApiMessage(result, 'Impossible de renvoyer le lien.'));
      }
      setMessage(
        readApiMessage(result, 'Si nécessaire, un nouveau lien a été envoyé.'),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? getUserFacingAuthError(requestError.message)
          : 'Impossible de contacter le service. Réessaie.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link className="auth-brand" href="/">
        <span className="brand-mark">Y</span>
        yalla
      </Link>
      <section aria-labelledby="auth-title" className="auth-card">
        <p className="eyebrow">{isRegister ? 'BIENVENUE SUR YALLA' : 'BON RETOUR'}</p>
        <h1 id="auth-title">
          {isRegister ? 'Créer ton compte' : 'Se connecter'}
        </h1>
        <p className="auth-description">
          {isRegister
            ? 'Confirme ton adresse e-mail pour activer ton compte. Le numéro sera vérifié plus tard.'
            : 'Confirme d’abord ton adresse e-mail si tu viens de créer ton compte.'}
        </p>
        <form className="auth-form" onSubmit={submit}>
          <label>
            Adresse e-mail
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          {isRegister && (
            <label>
              Numéro de téléphone
              <input
                autoComplete="tel"
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="+235… ou +33…"
                pattern="^\+[1-9]\d{7,14}$"
                required
                type="tel"
                value={phoneNumber}
              />
              <small>Format international avec l’indicatif, par exemple +33 ou +235.</small>
            </label>
          )}
          <label>
            Mot de passe
            <input
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={12}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            {isRegister && <small>12 caractères minimum.</small>}
          </label>
          {isRegister && (
            <label>
              Confirmer le mot de passe
              <input
                autoComplete="new-password"
                minLength={12}
                onChange={(event) => setConfirmation(event.target.value)}
                required
                type="password"
                value={confirmation}
              />
            </label>
          )}
          <button className="auth-submit" disabled={isLoading} type="submit">
            {isLoading
              ? 'Patiente…'
              : isRegister
                ? 'Créer mon compte'
                : 'Se connecter'}
          </button>
        </form>
        {message && (
          <p aria-live="polite" className="auth-message">
            {message}
          </p>
        )}
        {error && (
          <p aria-live="assertive" className="auth-error">
            {error}
          </p>
        )}
        {isRegister && message && (
          <button
            className="auth-resend"
            disabled={isLoading}
            onClick={resendVerification}
            type="button"
          >
            Renvoyer le lien de confirmation
          </button>
        )}
        <p className="auth-switch">
          {isRegister ? 'Tu as déjà un compte ?' : 'Pas encore de compte ?'}{' '}
          <Link href={isRegister ? '/connexion' : '/inscription'}>
            {isRegister ? 'Se connecter' : 'Créer un compte'}
          </Link>
        </p>
        <Link className="auth-home" href="/">
          Retour à l’accueil
        </Link>
      </section>
    </main>
  );
}

function readApiMessage(result: ApiMessage, fallback: string): string {
  if (typeof result.message === 'string') {
    return result.message;
  }
  if (Array.isArray(result.message)) {
    const message = result.message
      .filter((item): item is string => typeof item === 'string')
      .join(' ');
    return message || fallback;
  }
  return fallback;
}

function getUserFacingAuthError(message: string): string {
  if (message === 'Email delivery is not configured') {
    return 'L’inscription par e-mail n’est pas encore configurée sur le serveur. Il faut renseigner les paramètres SMTP dans le fichier .env du projet, puis redémarrer l’API.';
  }

  if (message === 'The confirmation email could not be sent') {
    return 'Le serveur e-mail n’a pas accepté l’envoi. Vérifie les paramètres SMTP dans le fichier .env du projet.';
  }

  return message;
}
