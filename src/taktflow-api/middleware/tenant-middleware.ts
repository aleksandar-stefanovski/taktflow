import { ForbiddenException } from '@taktflow/domain/exceptions/forbidden-exception.js';
import { UnauthorizedException } from '@taktflow/domain/exceptions/unauthorized-exception.js';

export function requireTenantId(tenantId: string | undefined): string {
  if (!tenantId) throw new UnauthorizedException('Authentication required');
  return tenantId;
}

export function assertTenantOwnership(
  resourceTenantId: string,
  requestTenantId: string,
): void {
  if (resourceTenantId !== requestTenantId) throw new ForbiddenException();
}
