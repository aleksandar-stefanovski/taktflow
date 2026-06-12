import { randomUUID } from 'node:crypto';

export class EntityKey {
  readonly id:       string;
  readonly tenantId: string | null;

  constructor(id: string, tenantId: string | null);
  constructor(tenantId: string | null);
  constructor(idOrTenantId: string | null, tenantId?: string | null) {
    if (tenantId !== undefined) {
      this.id       = idOrTenantId as string;
      this.tenantId = tenantId;
    } else {
      this.id       = randomUUID();
      this.tenantId = idOrTenantId;
    }
  }
}
