import { EntityBase } from './entity-base.js';
import { EntityKey } from './entity-key.js';
import type { HasSoftDelete } from './has-soft-delete.interface.js';

export type UserRole = 'super_admin' | 'owner';

export class User extends EntityBase implements HasSoftDelete {
  readonly email:             string;
  passwordHash:               string;
  readonly firstName:         string;
  readonly lastName:          string;
  role:                       UserRole;
  refreshToken:               string | null;
  refreshTokenExpiry:         Date | null;
  lastLogin:                  Date | null;
  deletedAt:                  Date | null = null;

  constructor(props: {
    key:                 EntityKey;
    email:               string;
    passwordHash:        string;
    firstName:           string;
    lastName:            string;
    role?:               UserRole;
    refreshToken?:       string | null;
    refreshTokenExpiry?: Date | null;
    lastLogin?:          Date | null;
    createdAt?:          Date;
    updatedAt?:          Date;
  }) {
    super(props.key, props.createdAt, props.updatedAt);
    this.email              = props.email;
    this.passwordHash       = props.passwordHash;
    this.firstName          = props.firstName;
    this.lastName           = props.lastName;
    this.role               = props.role ?? 'owner';
    this.refreshToken       = props.refreshToken ?? null;
    this.refreshTokenExpiry = props.refreshTokenExpiry ?? null;
    this.lastLogin          = props.lastLogin ?? null;
  }
}
