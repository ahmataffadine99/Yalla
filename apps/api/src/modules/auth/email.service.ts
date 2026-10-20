import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly config: ConfigService) {}

  assertConfigured(): void {
    const host = this.config.get<string>('SMTP_HOST');
    const from = this.config.get<string>('SMTP_FROM');
    if (!host || !from) {
      throw new ServiceUnavailableException(
        'Email delivery is not configured',
      );
    }

    const username = this.config.get<string>('SMTP_USER');
    const password = this.config.get<string>('SMTP_PASSWORD');
    if (Boolean(username) !== Boolean(password)) {
      throw new ServiceUnavailableException(
        'SMTP username and password must both be configured',
      );
    }
  }

  async sendVerificationLink(email: string, link: string): Promise<void> {
    this.assertConfigured();
    const host = this.config.get<string>('SMTP_HOST');
    const from = this.config.get<string>('SMTP_FROM');
    const username = this.config.get<string>('SMTP_USER');
    const password = this.config.get<string>('SMTP_PASSWORD');

    const transporter = nodemailer.createTransport({
      host,
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: this.config.get<boolean>('SMTP_SECURE', false),
      ...(username && password
        ? { auth: { user: username, pass: password } }
        : {}),
    });

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Confirme ton adresse e-mail — Yalla',
        text: [
          'Bienvenue sur Yalla !',
          'Pour confirmer ton adresse e-mail, ouvre ce lien :',
          link,
          'Ce lien expire dans 24 heures. Si tu n’es pas à l’origine de cette demande, ignore ce message.',
        ].join('\n\n'),
        html: `<p>Bienvenue sur Yalla !</p><p>Pour confirmer ton adresse e-mail, clique sur ce lien :</p><p><a href="${link}">Confirmer mon adresse e-mail</a></p><p>Ce lien expire dans 24 heures. Si tu n’es pas à l’origine de cette demande, ignore ce message.</p>`,
      });
    } catch {
      throw new ServiceUnavailableException(
        'The confirmation email could not be sent',
      );
    } finally {
      transporter.close();
    }
  }
}
