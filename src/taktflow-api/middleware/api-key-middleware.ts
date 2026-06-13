import { createHash, timingSafeEqual } from 'node:crypto';

import type { FastifyRequest, FastifyReply } from 'fastify';

import { NotFoundException } from '@taktflow/domain/exceptions/not-found-exception.js';
import { UnauthorizedException } from '@taktflow/domain/exceptions/unauthorized-exception.js';
import { TenantDeletedException } from '@taktflow/domain/exceptions/tenant-deleted-exception.js';
import { tenantContextStore } from '@taktflow/infra/context/tenant-context-store.js';
import { HTTP_CONSTANTS } from '@api/constants/http.constants.js';

export async function apiKeyMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const rawKey = request.headers[HTTP_CONSTANTS.API_KEY_HEADER];
  if (typeof rawKey !== 'string' || rawKey.length === 0) {
    throw new UnauthorizedException('API key required');
  }

  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const record  = await request.server.repos.apiKeys.findByKeyHash(keyHash);
  if (!record) throw new UnauthorizedException('Invalid API key');

  // NOTE: timing-safe comparison prevents timing attacks — do not use ===
  const inputBuf  = Buffer.from(keyHash, 'hex');
  const storedBuf = Buffer.from(record.keyHash, 'hex');
  if (inputBuf.length !== storedBuf.length || !timingSafeEqual(inputBuf, storedBuf)) {
    throw new UnauthorizedException('Invalid API key');
  }

  const tenantId = record.key.tenantId;
  if (!tenantId) throw new UnauthorizedException('API key has no associated tenant');

  const tenant = await request.server.repos.tenants.findByIdIncludingDeleted(tenantId);
  if (!tenant) throw new NotFoundException('Tenant', tenantId);
  if (tenant.deletedAt !== null) throw new TenantDeletedException();

  request.tenantId = tenantId;

  const context = tenantContextStore.getStore();
  if (context) context.tenantId = tenantId;

  void request.server.repos.apiKeys
    .update(record.id, { lastUsed: new Date() })
    .catch(() => {});
}
