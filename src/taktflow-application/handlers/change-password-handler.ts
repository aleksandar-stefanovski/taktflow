import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';
import { UnauthorizedException } from '@domain/exceptions/unauthorized-exception.js';

import type { IPasswordService } from '../interfaces/password-service.interface.js';

export class ChangePasswordHandler {
  constructor(
    private readonly users: IUserRepository,
    private readonly passwords: IPasswordService,
  ) {}

  async handle(request: {
    userId:          string;
    tenantId:        string;
    currentPassword: string;
    newPassword:     string;
  }): Promise<void> {
    const user = await this.users.findById(request.userId, request.tenantId);
    if (!user) throw new NotFoundException('User', request.userId);

    const isValid = await this.passwords.verify(user.passwordHash, request.currentPassword);
    if (!isValid) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await this.passwords.hash(request.newPassword);

    await this.users.update(user.id, user.tenantId, { passwordHash });
  }
}
