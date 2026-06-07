import type { User } from '@domain/entities/user.js';

export class UserResponse {
  readonly id:        string;
  readonly tenantId:  string;
  readonly email:     string;
  readonly firstName: string;
  readonly lastName:  string;
  readonly role:      string;
  readonly lastLogin: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(user: User) {
    this.id        = user.id;
    this.tenantId  = user.tenantId;
    this.email     = user.email;
    this.firstName = user.firstName;
    this.lastName  = user.lastName;
    this.role      = user.role;
    this.lastLogin = user.lastLogin?.toISOString() ?? null;
    this.createdAt = user.createdAt.toISOString();
    this.updatedAt = user.updatedAt.toISOString();
  }

  static mapFromEntity(user: User): UserResponse {
    return new UserResponse(user);
  }
}
