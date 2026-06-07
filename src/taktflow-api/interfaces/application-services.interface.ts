export interface ApplicationServices {
  token: {
    verifyAccessToken(token: string): Promise<{ sub: string; orgId: string }>;
    signAccessToken(payload: { sub: string; orgId: string }): Promise<string>;
    signRefreshToken(payload: { sub: string; orgId: string }): Promise<string>;
    verifyRefreshToken(token: string): Promise<{ sub: string; orgId: string }>;
  };
  password: {
    hash(password: string): Promise<string>;
    verify(hash: string, password: string): Promise<boolean>;
  };
}
