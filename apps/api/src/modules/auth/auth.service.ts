import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { Repository } from 'typeorm';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  createAccessToken,
} from './access-token';
import { EmailService } from './email.service';
import { UserEntity } from '../users/user.entity';

const scrypt = promisify(scryptCallback);
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const REGISTRATION_MESSAGE =
  'Si ces informations permettent une inscription, un lien de confirmation sera envoyé par e-mail.';
const RESEND_MESSAGE =
  'Si un compte en attente de confirmation existe pour cette adresse, un nouveau lien sera envoyé.';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async register(input: {
    email: string;
    phoneNumber: string;
    password: string;
  }): Promise<{ message: string }> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.users.findOne({
      where: [{ email }, { phoneNumber: input.phoneNumber }],
    });
    if (existing) {
      return { message: REGISTRATION_MESSAGE };
    }

    this.email.assertConfigured();
    const token = randomBytes(32).toString('base64url');
    const user = this.users.create({
      id: randomUUID(),
      email,
      phoneNumber: input.phoneNumber,
      passwordHash: await hashPassword(input.password),
      emailVerifiedAt: null,
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpiresAt: new Date(
        Date.now() + EMAIL_VERIFICATION_TTL_MS,
      ),
    });

    try {
      await this.users.save(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        return { message: REGISTRATION_MESSAGE };
      }
      throw error;
    }

    await this.sendVerificationEmail(user.email, token);
    return { message: REGISTRATION_MESSAGE };
  }

  async resendVerification(emailInput: string): Promise<{ message: string }> {
    const email = emailInput.trim().toLowerCase();
    const user = await this.users.findOneBy({ email });
    if (!user || user.emailVerifiedAt) {
      return { message: RESEND_MESSAGE };
    }

    this.email.assertConfigured();
    const token = randomBytes(32).toString('base64url');
    user.emailVerificationTokenHash = hashToken(token);
    user.emailVerificationExpiresAt = new Date(
      Date.now() + EMAIL_VERIFICATION_TTL_MS,
    );
    await this.users.save(user);
    await this.sendVerificationEmail(user.email, token);

    return { message: RESEND_MESSAGE };
  }

  async verifyEmail(token: string): Promise<{ emailVerified: true }> {
    const user = await this.users.findOneBy({
      emailVerificationTokenHash: hashToken(token),
    });
    if (
      !user ||
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() <= Date.now()
    ) {
      throw new ConflictException('The confirmation link is invalid or expired');
    }

    const tokenHash = hashToken(token);
    const result = await this.users.update(
      { id: user.id, emailVerificationTokenHash: tokenHash },
      {
        emailVerifiedAt: new Date(),
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    );
    if (result.affected !== 1) {
      throw new ConflictException('The confirmation link is invalid or expired');
    }

    return { emailVerified: true };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<{
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
    user: { id: string; email: string; phoneNumber: string };
  }> {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.findOneBy({ email });
    const passwordMatches =
      user && (await verifyPassword(input.password, user.passwordHash));

    if (!user || !user.emailVerifiedAt || !passwordMatches) {
      throw new UnauthorizedException(
        'Email ou mot de passe incorrect, ou adresse e-mail non confirmée',
      );
    }

    const accessToken = createAccessToken(
      { id: user.id, email: user.email },
      this.config.getOrThrow<string>('AUTH_TOKEN_SECRET'),
    );

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    };
  }

  async getProfile(userId: string): Promise<{
    id: string;
    email: string;
    phoneNumber: string;
    emailVerified: boolean;
  }> {
    const user = await this.users.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('Authentication is required');
    }

    return {
      id: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      emailVerified: Boolean(user.emailVerifiedAt),
    };
  }

  private async sendVerificationEmail(email: string, token: string) {
    const clientOrigin = this.config.getOrThrow<string>('CLIENT_WEB_ORIGIN');
    const link = new URL('/confirmer-email', clientOrigin);
    link.searchParams.set('token', token);
    await this.email.sendVerificationLink(email, link.toString());
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [saltHex, keyHex, extra] = storedHash.split(':');
  if (
    !saltHex ||
    !keyHex ||
    extra !== undefined ||
    !/^[a-f\d]{32}$/i.test(saltHex) ||
    !/^[a-f\d]{128}$/i.test(keyHex)
  ) {
    return false;
  }

  const expected = Buffer.from(keyHex, 'hex');
  const actual = (await scrypt(
    password,
    Buffer.from(saltHex, 'hex'),
    expected.length,
  )) as Buffer;

  return timingSafeEqual(expected, actual);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'driverError' in error &&
    typeof error.driverError === 'object' &&
    error.driverError !== null &&
    'code' in error.driverError &&
    error.driverError.code === '23505'
  );
}
