import type { FastifyRequest, FastifyReply } from 'fastify';

import { NotFoundException } from '@domain/exceptions/not-found-exception.js';
import { UnauthorizedException } from '@domain/exceptions/unauthorized-exception.js';
import { TenantDeletedException } from '@domain/exceptions/tenant-deleted-exception.js';
import { TokenService } from '@infrastructure/auth/token-service.js';
import { tenantContextStore } from '@infrastructure/context/tenant-context-store.js';
import { authConfig } from '@api/config/auth.config.js';

const tokenService = new TokenService(
  authConfig.JWT_ACCESS_SECRET,
  authConfig.JWT_REFRESH_SECRET,
  authConfig.JWT_ACCESS_TOKEN_EXPIRY,
  authConfig.REFRESH_TOKEN_EXPIRY_DAYS,
);

export async function jwtMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedException('Bearer token required');
  }

  const token = authHeader.slice(7);

  let payload: { sub: string; orgId?: string; role?: string };
  try {
    payload = await tokenService.verifyAccessToken(token);
  } catch {
    throw new UnauthorizedException('Invalid or expired access token');
  }

  if (!payload.orgId) {
    throw new UnauthorizedException('Tenant access required');
  }

  const tenant = await request.server.repos.tenants.findByIdIncludingDeleted(payload.orgId);
  if (!tenant) throw new NotFoundException('Tenant', payload.orgId);
  if (tenant.deletedAt !== null) throw new TenantDeletedException();

  request.tenantId = payload.orgId;
  request.userId   = payload.sub;
  request.role     = payload.role;

  const context = tenantContextStore.getStore();
  if (context) context.tenantId = payload.orgId;
}
