import { and, eq, isNull } from 'drizzle-orm';

import type { DrizzleDb } from '../../database.js';
import { users } from '../../schema/users.js';
import type { UserRow } from '../../schema/users.js';
import { User } from '@taktflow/domain/entities/user.js';
import type { UserRole } from '@taktflow/domain/entities/user.js';
import { EntityKey } from '@taktflow/domain/entities/entity-key.js';
import type { ICurrentTenantProvider } from '@taktflow/domain/interfaces/current-tenant-provider.interface.js';
import { EntityBaseReadonlyRepository } from './entity-base-readonly-repository.js';

export class UserReadonlyRepository extends EntityBaseReadonlyRepository<User> {
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

  static toDomain(row: UserRow): User {
    const entity = new User({
      key:                EntityKey.reconstitute(row.id, row.tenantId),
      email:              row.email,
      passwordHash:       row.passwordHash,
      firstName:          row.firstName,
      lastName:           row.lastName,
      role:               row.role as UserRole,
      refreshToken:       row.refreshToken ?? null,
      refreshTokenExpiry: row.refreshTokenExpiry ?? null,
      lastLogin:          row.lastLogin ?? null,
      createdAt:          row.createdAt,
      updatedAt:          row.updatedAt,
    });
    entity.deletedAt = row.deletedAt ?? null;
    return entity;
  }
}
