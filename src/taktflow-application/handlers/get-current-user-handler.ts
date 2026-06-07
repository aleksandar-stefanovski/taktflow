import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';
import type { User } from '@domain/entities/user.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class GetCurrentUserHandler {
  constructor(private readonly users: IUserRepository) {}

  async handle(userId: string, tenantId: string): Promise<User> {
    const user = await this.users.findById(userId, tenantId);
    if (!user) throw new NotFoundException('User', userId);
    return user;
  }
}
