import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';
import type { User } from '@domain/entities/user.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

export class UpdateUserHandler {
  constructor(private readonly users: IUserRepository) {}

  async handle(request: {
    userId:     string;
    tenantId:   string;
    firstName?: string;
    lastName?:  string;
  }): Promise<User> {
    const user = await this.users.findById(request.userId, request.tenantId);
    if (!user) throw new NotFoundException('User', request.userId);

    return this.users.update(user.id, user.tenantId, {
      ...(request.firstName !== undefined && { firstName: request.firstName }),
      ...(request.lastName  !== undefined && { lastName:  request.lastName  }),
    });
  }
}
