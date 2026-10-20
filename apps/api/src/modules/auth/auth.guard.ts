import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { verifyAccessToken, type AuthenticatedUser } from './access-token';

type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer (.+)$/);
    const secret = this.config.getOrThrow<string>('AUTH_TOKEN_SECRET');
    const user = match
      ? verifyAccessToken(match[1], secret)
      : null;

    if (!user) {
      throw new UnauthorizedException('Authentication is required');
    }

    request.user = user;
    return true;
  }
}
