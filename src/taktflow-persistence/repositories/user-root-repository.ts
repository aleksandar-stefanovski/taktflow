import { and, eq, isNull } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { users } from '../schema/users.js';
import { User } from '@taktflow/domain/entities/user.js';
import type { IUserRootRepository } from '@taktflow/domain/interfaces/user-root-repository.interface.js';
import { UserReadonlyRepository } from './readonly/user-readonly-repository.js';

export class UserRootRepository implements IUserRootRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findById(id: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    const [row] = rows;
    return row ? UserReadonlyRepository.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    const [row] = rows;
    return row ? UserReadonlyRepository.toDomain(row) : null;
  }

  async create(user: User): Promise<User> {
    const rows = await this.db
      .insert(users)
      .values({
        id:                 user.id,
        tenantId:           user.key.tenantId,
        email:              user.email,
        passwordHash:       user.passwordHash,
        firstName:          user.firstName,
        lastName:           user.lastName,
        role:               user.role,
        refreshToken:       user.refreshToken,
        refreshTokenExpiry: user.refreshTokenExpiry,
        lastLogin:          user.lastLogin,
        createdAt:          user.createdAt,
        updatedAt:          user.updatedAt,
      })
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Insert returned no rows');
    return UserReadonlyRepository.toDomain(row);
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const rows = await this.db
      .update(users)
      .set({
        ...(updates.firstName !== undefined && { firstName: updates.firstName }),
        ...(updates.lastName !== undefined && { lastName: updates.lastName }),
        ...(updates.passwordHash !== undefined && { passwordHash: updates.passwordHash }),
        ...(updates.role !== undefined && { role: updates.role }),
        ...(updates.refreshToken !== undefined && { refreshToken: updates.refreshToken }),
        ...(updates.refreshTokenExpiry !== undefined && { refreshTokenExpiry: updates.refreshTokenExpiry }),
        ...(updates.lastLogin !== undefined && { lastLogin: updates.lastLogin }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return UserReadonlyRepository.toDomain(row);
  }
}
