export interface ITokenService {
  signAccessToken(payload: { sub: string; orgId?: string; role: string }): Promise<string>;
  signRefreshToken(payload: { sub: string; orgId?: string; role: string }): Promise<string>;
  verifyRefreshToken(token: string): Promise<{ sub: string; orgId?: string; role?: string }>;
}
