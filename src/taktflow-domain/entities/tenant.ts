import { BaseEntity } from './base-entity.js';
import type { HasSoftDelete } from '../interfaces/has-soft-delete.interface.js';

export type PlanTier = 'starter' | 'growth' | 'business' | 'enterprise';

export class Tenant extends BaseEntity implements HasSoftDelete {
  readonly name: string;
  plan:          PlanTier;
  deletedAt:     Date | null = null;

  constructor(props: {
    name:       string;
    plan?:      PlanTier;
    id?:        string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.id, props.createdAt, props.updatedAt);
    this.name = props.name;
    this.plan = props.plan ?? 'starter';
  }
}
