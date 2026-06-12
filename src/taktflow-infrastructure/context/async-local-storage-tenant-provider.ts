import type { ICurrentTenantProvider } from '@domain/interfaces/current-tenant-provider.interface.js';
import { UnauthorizedException } from '@domain/exceptions/unauthorized-exception.js';

import { tenantContextStore } from './tenant-context-store.js';

export class AsyncLocalStorageTenantProvider implements ICurrentTenantProvider {
  getTenantId(): string {
    const context = tenantContextStore.getStore();
    if (!context?.tenantId) {
      throw new UnauthorizedException('Tenant context is not available in the current execution scope');
    }
    return context.tenantId;
  }
}
