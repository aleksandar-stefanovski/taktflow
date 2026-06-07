export interface ITokenService {
  signAccessToken(payload: { sub: string; orgId: string }): Promise<string>;
  signRefreshToken(payload: { sub: string; orgId: string }): Promise<string>;
  verifyRefreshToken(token: string): Promise<{ sub: string; orgId: string }>;
}
