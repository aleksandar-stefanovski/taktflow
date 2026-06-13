import { EntityBase } from './entity-base.js';
import { EntityKey } from './entity-key.js';
import type { HasDelete } from './has-delete.interface.js';

export type PlanTier = 'starter' | 'growth' | 'business' | 'enterprise';

export class Tenant extends EntityBase implements HasDelete {
  readonly name: string;
  plan:          PlanTier;
  deletedAt:     Date | null = null;

  constructor(props: {
    key:        EntityKey;
    name:       string;
    plan?:      PlanTier;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.key, props.createdAt, props.updatedAt);
    this.name = props.name;
    this.plan = props.plan ?? 'starter';
  }
}
