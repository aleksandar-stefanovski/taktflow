import { and, eq, isNull } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { users } from '../schema/users.js';
import type { UserRow } from '../schema/users.js';
import { User } from '@taktflow/domain/entities/user.js';
import type { IUserRepository } from '@taktflow/domain/interfaces/user-repository.interface.js';
import type { ICurrentTenantProvider } from '@taktflow/domain/interfaces/current-tenant-provider.interface.js';
import { UserReadonlyRepository } from './readonly/user-readonly-repository.js';
import { EntityBaseRepository } from './entity-base-repository.js';

export class UserRepository
  extends EntityBaseRepository<User>
  implements IUserRepository {

  constructor(db: DrizzleDb, tenantProvider: ICurrentTenantProvider) {
    super(db, users, tenantProvider);
  }

  protected mapToDomain(row: Record<string, unknown>): User {
    return UserReadonlyRepository.toDomain(row as UserRow);
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
      .where(and(eq(users.id, id), eq(users.tenantId, this.tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return UserReadonlyRepository.toDomain(row);
  }

  async anonymize(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({
        email:              `deleted_${id}@deleted.invalid`,
        firstName:          'Deleted',
        lastName:           'User',
        passwordHash:       `redacted_${id}`,
        refreshToken:       null,
        refreshTokenExpiry: null,
        deletedAt:          new Date(),
        updatedAt:          new Date(),
      })
      .where(and(eq(users.id, id), eq(users.tenantId, this.tenantId)));
  }
}
