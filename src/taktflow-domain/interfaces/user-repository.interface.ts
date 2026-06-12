import type { User } from '@domain/entities/user.js';
import type { IUserReadRepository } from './readonly/user-read-repository.interface.js';
import type { IEntityBaseRepository } from './entity-base-repository.interface.js';

export interface IUserRepository
  extends IUserReadRepository,
    IEntityBaseRepository<User> {}
