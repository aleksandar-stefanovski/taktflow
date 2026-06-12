import { AsyncLocalStorage } from 'node:async_hooks';

import type { TenantContext } from '../interfaces/tenant-context.interface.js';

export const tenantContextStore = new AsyncLocalStorage<TenantContext>();
