import { BaseEntity } from './base-entity.js';
import type { HasTenant } from '../interfaces/has-tenant.interface.js';
import type { HasSoftDelete } from '../interfaces/has-soft-delete.interface.js';
import type { TopicConfig } from '../interfaces/topic-config.interface.js';
export class Topic extends BaseEntity implements HasTenant, HasSoftDelete {
  readonly tenantId: string;
  readonly name:     string;
  config:            TopicConfig;
  deletedAt:         Date | null = null;

  constructor(props: {
    tenantId:   string;
    name:       string;
    config:     TopicConfig;
    id?:        string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this.tenantId = props.tenantId;
    this.name     = props.name;
    this.config   = props.config;
  }
}
