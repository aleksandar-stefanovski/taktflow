import { SignJWT, jwtVerify, errors as JoseErrors } from 'jose';

import { UnauthorizedException } from '@taktflow/domain/exceptions/unauthorized-exception.js';

export class TokenService {
  private readonly accessSecret:  Uint8Array;
  private readonly refreshSecret: Uint8Array;
  private readonly refreshTokenExpiry: string;

  constructor(
    accessSecret:          string,
    refreshSecret:         string,
    private readonly accessTokenExpiry:   string,
    refreshTokenExpiryDays:               number,
  ) {
    this.accessSecret       = new TextEncoder().encode(accessSecret);
    this.refreshSecret      = new TextEncoder().encode(refreshSecret);
    this.refreshTokenExpiry = `${refreshTokenExpiryDays}d`;
  }

  async signAccessToken(payload: { sub: string; orgId?: string; role: string }): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.accessTokenExpiry)
      .sign(this.accessSecret);
  }

  async signRefreshToken(payload: { sub: string; orgId?: string; role: string }): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.refreshTokenExpiry)
      .sign(this.refreshSecret);
  }

  async verifyAccessToken(token: string): Promise<{ sub: string; orgId?: string; role?: string }> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret);
      return {
        sub:  String(payload.sub),
        ...(payload['orgId'] !== undefined && { orgId: String(payload['orgId']) }),
        ...(payload['role']  !== undefined && { role:  String(payload['role'])  }),
      };
    } catch (error) {
      if (error instanceof JoseErrors.JWTExpired) {
        throw new UnauthorizedException('Access token expired');
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<{ sub: string; orgId?: string; role?: string }> {
    try {
      const { payload } = await jwtVerify(token, this.refreshSecret);
      return {
        sub:  String(payload.sub),
        ...(payload['orgId'] !== undefined && { orgId: String(payload['orgId']) }),
        ...(payload['role']  !== undefined && { role:  String(payload['role'])  }),
      };
    } catch (error) {
      if (error instanceof JoseErrors.JWTExpired) {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
