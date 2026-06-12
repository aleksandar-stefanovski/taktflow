import type { User } from '@domain/entities/user.js';
import type { IEntityBaseReadonlyRepository } from './entity-base-readonly-repository.interface.js';

export interface IUserReadRepository extends IEntityBaseReadonlyRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
