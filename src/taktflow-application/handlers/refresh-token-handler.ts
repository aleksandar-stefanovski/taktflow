import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';
import { UnauthorizedException } from '@domain/exceptions/unauthorized-exception.js';

import type { ITokenService } from '../interfaces/token-service.interface.js';
import type { TokenPair } from '../interfaces/token-pair.interface.js';

const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export class RefreshTokenHandler {
  constructor(
    private readonly users: IUserRepository,
    private readonly tokens: ITokenService,
  ) {}

  async handle(request: { refreshToken: string }): Promise<TokenPair> {
    const payload = await this.tokens.verifyRefreshToken(request.refreshToken);

    const user = await this.users.findById(payload.sub, payload.orgId);

    if (!user || user.refreshToken !== request.refreshToken) {
      if (user) {
        await this.users.update(user.id, user.tenantId, {
          refreshToken:       null,
          refreshTokenExpiry: null,
        });
      }
      throw new UnauthorizedException('Refresh token invalid or reused');
    }

    const accessToken  = await this.tokens.signAccessToken({ sub: user.id, orgId: user.tenantId });
    const refreshToken = await this.tokens.signRefreshToken({ sub: user.id, orgId: user.tenantId });
    const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await this.users.update(user.id, user.tenantId, {
      refreshToken,
      refreshTokenExpiry,
    });

    return { accessToken, refreshToken };
  }
}
