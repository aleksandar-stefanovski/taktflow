import type { IUserRepository } from '@taktflow/domain/interfaces/user-repository.interface.js';
import { User } from '@taktflow/domain/entities/user.js';
import { EntityKey } from '@taktflow/domain/entities/entity-key.js';
import type { UserRole } from '@taktflow/domain/entities/user.js';
import { NotFoundException } from '@taktflow/domain/exceptions/not-found-exception.js';
import { ConflictException } from '@taktflow/domain/exceptions/conflict-exception.js';
import { UnauthorizedException } from '@taktflow/domain/exceptions/unauthorized-exception.js';

import type { IPasswordService } from '../contracts/password-service.interface.js';
import type { IUserService }     from '../interfaces/user-service.interface.js';

export class UserService implements IUserService {
  constructor(
    private readonly users:     IUserRepository,
    private readonly passwords: IPasswordService,
  ) {}

  async create(request: {
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
      key:       EntityKey.create(request.tenantId),
      email:     request.email,
      passwordHash,
      firstName: request.firstName,
      lastName:  request.lastName,
      role:      request.role ?? 'owner',
    });

    return this.users.create(user);
  }

  async getCurrent(userId: string, tenantId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException('User', userId);
    return user;
  }

  async update(request: {
    userId:     string;
    tenantId:   string;
    firstName?: string;
    lastName?:  string;
  }): Promise<User> {
    const user = await this.users.findById(request.userId);
    if (!user) throw new NotFoundException('User', request.userId);

    return this.users.update(user.id, {
      ...(request.firstName !== undefined && { firstName: request.firstName }),
      ...(request.lastName  !== undefined && { lastName:  request.lastName  }),
    });
  }

  async delete(userId: string, tenantId: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException('User', userId);
    await this.users.anonymize(userId);
  }

  async changePassword(request: {
    userId:          string;
    tenantId:        string;
    currentPassword: string;
    newPassword:     string;
  }): Promise<void> {
    const user = await this.users.findById(request.userId);
    if (!user) throw new NotFoundException('User', request.userId);

    const isValid = await this.passwords.verify(user.passwordHash, request.currentPassword);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await this.passwords.hash(request.newPassword);
    await this.users.update(user.id, { passwordHash });
  }
}
