import { EntityBase } from './entity-base.js';
import { EntityKey } from './entity-key.js';
import type { HasDelete } from './has-delete.interface.js';

export type ConsumerType   = 'push' | 'pull';
export type ConsumerStatus = 'active' | 'paused';

export class Consumer extends EntityBase implements HasDelete {
  readonly topicId:     string;
  readonly name:        string;
  readonly type:        ConsumerType;
  url:                  string | null;
  readonly secret:      string;
  readonly environment: string;
  status:               ConsumerStatus;
  deletedAt:            Date | null = null;

  constructor(props: {
    key:         EntityKey;
    topicId:     string;
    name:        string;
    type:        ConsumerType;
    url:         string | null;
    secret:      string;
    environment: string;
    status?:     ConsumerStatus;
    createdAt?:  Date;
    updatedAt?:  Date;
  }) {
    super(props.key, props.createdAt, props.updatedAt);
    this.topicId     = props.topicId;
    this.name        = props.name;
    this.type        = props.type;
    this.url         = props.url;
    this.secret      = props.secret;
    this.environment = props.environment;
    this.status      = props.status ?? 'active';
  }
}
