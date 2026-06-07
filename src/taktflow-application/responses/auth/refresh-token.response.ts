export class RefreshTokenResponse {
  readonly accessToken:  string;
  readonly refreshToken: string;

  constructor(data: { accessToken: string; refreshToken: string }) {
    this.accessToken  = data.accessToken;
    this.refreshToken = data.refreshToken;
  }

  static mapFromEntity(data: { accessToken: string; refreshToken: string }): RefreshTokenResponse {
    return new RefreshTokenResponse(data);
  }
}
