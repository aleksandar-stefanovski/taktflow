import { BaseEntity } from './base-entity.js';
import type { HasTenant } from '../interfaces/has-tenant.interface.js';
import type { HasSoftDelete } from '../interfaces/has-soft-delete.interface.js';

export class ApiKey extends BaseEntity implements HasTenant, HasSoftDelete {
  readonly tenantId:    string;
  readonly name:        string;
  readonly keyHash:     string;
  readonly keyPrefix:   string;
  readonly environment: string;
  lastUsed:  Date | null;
  deletedAt: Date | null = null;

  constructor(props: {
    tenantId:    string;
    name:        string;
    keyHash:     string;
    keyPrefix:   string;
    environment: string;
    lastUsed?:   Date | null;
    id?:         string;
    createdAt?:  Date;
    updatedAt?:  Date;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this.tenantId    = props.tenantId;
    this.name        = props.name;
    this.keyHash     = props.keyHash;
    this.keyPrefix   = props.keyPrefix;
    this.environment = props.environment;
    this.lastUsed    = props.lastUsed ?? null;
  }
}
