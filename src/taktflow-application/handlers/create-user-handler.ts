import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';
import { User } from '@domain/entities/user.js';
import type { UserRole } from '@domain/entities/user.js';
import { ConflictException } from '@domain/exceptions/conflict-exception.js';

import type { IPasswordService } from '../interfaces/password-service.interface.js';

export class CreateUserHandler {
  constructor(
    private readonly users: IUserRepository,
    private readonly passwords: IPasswordService,
  ) {}

  async handle(request: {
    tenantId:  string;
    email:     string;
    password:  string;
    firstName: string;
    lastName:  string;
    role?:     UserRole;
  }): Promise<User> {
    const existing = await this.users.findByEmail(request.email);
    if (existing) throw new ConflictException('A user with this email already exists');

    const passwordHash = await this.passwords.hash(request.password);

    const user = new User({
      tenantId:     request.tenantId,
      email:        request.email,
      passwordHash,
      firstName:    request.firstName,
      lastName:     request.lastName,
      role:         request.role ?? 'member',
    });

    return this.users.create(user);
  }
}
