import { EntityBase } from './entity-base.js';
import { EntityKey } from './entity-key.js';
import type { HasSoftDelete } from './has-soft-delete.interface.js';
import type { TopicConfig } from '../value-objects/topic-config.js';

export class Topic extends EntityBase implements HasSoftDelete {
  readonly name: string;
  config:        TopicConfig;
  deletedAt:     Date | null = null;

  constructor(props: {
    key:        EntityKey;
    name:       string;
    config:     TopicConfig;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(props.key, props.createdAt, props.updatedAt);
    this.name   = props.name;
    this.config = props.config;
  }
}
