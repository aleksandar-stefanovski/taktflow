import { and, eq, desc, count, isNull } from 'drizzle-orm';

import type { DrizzleDb } from '../database.js';
import { users } from '../schema/users.js';
import type { UserRow } from '../schema/users.js';
import { User } from '@domain/entities/user.js';
import type { UserRole } from '@domain/entities/user.js';
import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';
import type { PaginationOptions } from '@domain/interfaces/pagination-options.interface.js';
import type { PagedData } from '@domain/interfaces/paged-data.interface.js';

export class UserRepository implements IUserRepository {
  constructor(private readonly db: DrizzleDb) {}

  async findById(id: string, tenantId: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId), isNull(users.deletedAt)))
      .limit(1);

    const [row] = rows;
    return row ? UserRepository.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    const [row] = rows;
    return row ? UserRepository.toDomain(row) : null;
  }

  async findAll(tenantId: string, options?: PaginationOptions): Promise<PagedData<User>> {
    const page     = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 100;
    const offset   = (page - 1) * pageSize;

    const where = and(eq(users.tenantId, tenantId), isNull(users.deletedAt));

    const [rows, countResult] = await Promise.all([
      this.db
        .select()
        .from(users)
        .where(where)
        .limit(pageSize)
        .offset(offset)
        .orderBy(desc(users.createdAt)),
      this.db
        .select({ total: count() })
        .from(users)
        .where(where),
    ]);

    return {
      items:      rows.map(UserRepository.toDomain),
      totalCount: countResult[0]?.total ?? 0,
    };
  }

  async create(user: User): Promise<User> {
    const rows = await this.db
      .insert(users)
      .values({
        id:                 user.id,
        tenantId:           user.tenantId,
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
    return UserRepository.toDomain(row);
  }

  async update(id: string, tenantId: string, updates: Partial<User>): Promise<User> {
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
      .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))
      .returning();

    const [row] = rows;
    if (!row) throw new Error('Update returned no rows');
    return UserRepository.toDomain(row);
  }

  static toDomain(row: UserRow): User {
    const entity = new User({
      id:                 row.id,
      tenantId:           row.tenantId,
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
