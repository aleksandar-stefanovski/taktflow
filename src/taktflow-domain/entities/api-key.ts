import { EntityBase } from './entity-base.js';
import { EntityKey } from './entity-key.js';
import type { HasSoftDelete } from './has-soft-delete.interface.js';

export class ApiKey extends EntityBase implements HasSoftDelete {
  readonly name:        string;
  readonly keyHash:     string;
  readonly keyPrefix:   string;
  readonly environment: string;
  lastUsed:             Date | null;
  deletedAt:            Date | null = null;

  constructor(props: {
    key:         EntityKey;
    name:        string;
    keyHash:     string;
    keyPrefix:   string;
    environment: string;
    lastUsed?:   Date | null;
    createdAt?:  Date;
    updatedAt?:  Date;
  }) {
    super(props.key, props.createdAt, props.updatedAt);
    this.name        = props.name;
    this.keyHash     = props.keyHash;
    this.keyPrefix   = props.keyPrefix;
    this.environment = props.environment;
    this.lastUsed    = props.lastUsed ?? null;
  }
}
