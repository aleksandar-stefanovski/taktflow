import { BaseEntity } from './base-entity.js';
import type { HasSoftDelete } from '../interfaces/has-soft-delete.interface.js';

export type UserRole = 'owner' | 'admin' | 'member';

export class User extends BaseEntity implements HasSoftDelete {
  readonly tenantId:    string;
  readonly email:       string;
  passwordHash:         string;
  readonly firstName:   string;
  readonly lastName:    string;
  role:                 UserRole;
  refreshToken:         string | null;
  refreshTokenExpiry:   Date | null;
  lastLogin:            Date | null;
  deletedAt:            Date | null = null;

  constructor(props: {
    tenantId:            string;
    email:               string;
    passwordHash:        string;
    firstName:           string;
    lastName:            string;
    role?:               UserRole;
    refreshToken?:       string | null;
    refreshTokenExpiry?: Date | null;
    lastLogin?:          Date | null;
    id?:                 string;
    createdAt?:          Date;
    updatedAt?:          Date;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this.tenantId           = props.tenantId;
    this.email              = props.email;
    this.passwordHash       = props.passwordHash;
    this.firstName          = props.firstName;
    this.lastName           = props.lastName;
    this.role               = props.role ?? 'member';
    this.refreshToken       = props.refreshToken ?? null;
    this.refreshTokenExpiry = props.refreshTokenExpiry ?? null;
    this.lastLogin          = props.lastLogin ?? null;
  }
}
