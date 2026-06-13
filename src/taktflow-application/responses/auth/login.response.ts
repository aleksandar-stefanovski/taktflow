import type { User } from '@taktflow/domain/entities/user.js';

export class LoginResponse {
  readonly accessToken:  string;
  readonly refreshToken: string;
  readonly user: {
    readonly id:        string;
    readonly email:     string;
    readonly firstName: string;
    readonly lastName:  string;
    readonly role:      string;
  };

  constructor(data: { accessToken: string; refreshToken: string; user: User }) {
    this.accessToken  = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.user = {
      id:        data.user.id,
      email:     data.user.email,
      firstName: data.user.firstName,
      lastName:  data.user.lastName,
      role:      data.user.role,
    };
  }

  static mapFromEntity(data: { accessToken: string; refreshToken: string; user: User }): LoginResponse {
    return new LoginResponse(data);
  }
}
