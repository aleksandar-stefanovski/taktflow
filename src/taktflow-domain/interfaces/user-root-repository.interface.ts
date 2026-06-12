import type { User } from '@domain/entities/user.js';

export interface IUserRootRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
}
