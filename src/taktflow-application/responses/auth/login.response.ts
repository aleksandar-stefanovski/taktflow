import type { LoginUserSummary } from '../../interfaces/login-user-summary.interface.js';

export class LoginResponse {
  readonly accessToken:  string;
  readonly refreshToken: string;
  readonly user:         LoginUserSummary;

  constructor(data: { accessToken: string; refreshToken: string; user: LoginUserSummary }) {
    this.accessToken  = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.user         = data.user;
  }

  static mapFromEntity(data: { accessToken: string; refreshToken: string; user: LoginUserSummary }): LoginResponse {
    return new LoginResponse(data);
  }
}

