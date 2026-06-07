import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';
import { UnauthorizedException } from '@domain/exceptions/unauthorized-exception.js';

import type { ITokenService } from '../interfaces/token-service.interface.js';
import type { IPasswordService } from '../interfaces/password-service.interface.js';
import type { LoginResult } from '../interfaces/login-result.interface.js';

const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export class LoginHandler {
  constructor(
    private readonly users: IUserRepository,
    private readonly tokens: ITokenService,
    private readonly passwords: IPasswordService,
  ) {}

  async handle(request: { email: string; password: string }): Promise<LoginResult> {
    const user = await this.users.findByEmail(request.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.passwords.verify(user.passwordHash, request.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const accessToken  = await this.tokens.signAccessToken({ sub: user.id, orgId: user.tenantId });
    const refreshToken = await this.tokens.signRefreshToken({ sub: user.id, orgId: user.tenantId });
    const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await this.users.update(user.id, user.tenantId, {
      refreshToken,
      refreshTokenExpiry,
      lastLogin: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id:        user.id,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role,
      },
    };
  }
}
