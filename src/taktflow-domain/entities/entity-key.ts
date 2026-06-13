import { randomUUID } from 'node:crypto';

export class EntityKey {
  readonly id:       string;
  readonly tenantId: string | null;

  private constructor(id: string, tenantId: string | null) {
    this.id       = id;
    this.tenantId = tenantId;
  }

  static create(tenantId: string | null): EntityKey {
    return new EntityKey(randomUUID(), tenantId);
  }

  static reconstitute(id: string, tenantId: string | null): EntityKey {
    return new EntityKey(id, tenantId);
  }
}
