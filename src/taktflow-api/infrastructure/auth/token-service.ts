import { SignJWT, jwtVerify, errors as JoseErrors } from 'jose';

import { UnauthorizedException } from '@domain/exceptions/unauthorized-exception.js';
import { env } from '../../config/env.js';
import type { IAccessTokenPayload } from '../../interfaces/access-token-payload.interface.js';
import type { IRefreshTokenPayload } from '../../interfaces/refresh-token-payload.interface.js';

const ACCESS_TOKEN_EXPIRY  = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';

export class TokenService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;

  constructor() {
    this.accessSecret  = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
    this.refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
  }

  async signAccessToken(payload: IAccessTokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .sign(this.accessSecret);
  }

  async signRefreshToken(payload: IRefreshTokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .sign(this.refreshSecret);
  }

  async verifyAccessToken(token: string): Promise<IAccessTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret);
      return {
        sub:   String(payload.sub),
        orgId: String(payload['orgId']),
      };
    } catch (error) {
      if (error instanceof JoseErrors.JWTExpired) {
        throw new UnauthorizedException('Access token expired');
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<IRefreshTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.refreshSecret);
      return {
        sub:   String(payload.sub),
        orgId: String(payload['orgId']),
      };
    } catch (error) {
      if (error instanceof JoseErrors.JWTExpired) {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
