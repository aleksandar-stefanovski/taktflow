import { BaseEntity } from './base-entity.js';
import type { HasTenant } from '../interfaces/has-tenant.interface.js';
import type { HasSoftDelete } from '../interfaces/has-soft-delete.interface.js';
import type { ConsumerConfig } from '../interfaces/consumer-config.interface.js';
export type ConsumerType   = 'push' | 'pull';
export type ConsumerStatus = 'active' | 'paused';
export type RetryBackoff   = 'exponential' | 'fixed' | 'linear';

export class Consumer extends BaseEntity implements HasTenant, HasSoftDelete {
  readonly tenantId:    string;
  readonly topicId:     string;
  readonly name:        string;
  readonly type:        ConsumerType;
  url:                  string | null;
  readonly secret:      string;
  readonly environment: string;
  status:    ConsumerStatus;
  config:    ConsumerConfig;
  deletedAt: Date | null = null;

  constructor(props: {
    tenantId:    string;
    topicId:     string;
    name:        string;
    type:        ConsumerType;
    url:         string | null;
    secret:      string;
    environment: string;
    status?:     ConsumerStatus;
    config:      ConsumerConfig;
    id?:         string;
    createdAt?:  Date;
    updatedAt?:  Date;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this.tenantId    = props.tenantId;
    this.topicId     = props.topicId;
    this.name        = props.name;
    this.type        = props.type;
    this.url         = props.url;
    this.secret      = props.secret;
    this.environment = props.environment;
    this.status      = props.status ?? 'active';
    this.config      = props.config;
  }
}
