import type { User } from '../entities/user.js';
import type { PaginationOptions } from './pagination-options.interface.js';
import type { PagedData } from './paged-data.interface.js';

export interface IUserRepository {
  findById(id: string, tenantId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(tenantId: string, options?: PaginationOptions): Promise<PagedData<User>>;
  create(user: User): Promise<User>;
  update(id: string, tenantId: string, updates: Partial<User>): Promise<User>;
}
