import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';

export class LogoutHandler {
  constructor(private readonly users: IUserRepository) {}

  async handle(request: { userId: string; tenantId: string }): Promise<void> {
    const user = await this.users.findById(request.userId, request.tenantId);
    if (!user) return;

    await this.users.update(user.id, user.tenantId, {
      refreshToken:       null,
      refreshTokenExpiry: null,
    });
  }
}
