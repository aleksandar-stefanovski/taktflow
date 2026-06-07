import type { Tenant } from '@domain/entities/tenant.js';

import { RegisterTenantResponse } from '../responses/tenants/register-tenant.response.js';

export class TenantMapper {
  static toRegisterResponse(tenant: Tenant): RegisterTenantResponse {
    return new RegisterTenantResponse(tenant);
  }
}
