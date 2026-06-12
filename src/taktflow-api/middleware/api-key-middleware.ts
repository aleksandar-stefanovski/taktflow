import { createHash, timingSafeEqual } from 'node:crypto';

import type { FastifyRequest, FastifyReply } from 'fastify';

import { UnauthorizedException } from '@domain/exceptions/unauthorized-exception.js';
import { tenantContextStore } from '@infrastructure/context/tenant-context-store.js';
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

  request.tenantId = record.tenantId;

  const context = tenantContextStore.getStore();
  if (context) context.tenantId = record.tenantId;

  void request.server.repos.apiKeys
    .update(record.id, { lastUsed: new Date() })
    .catch(() => {});
}
