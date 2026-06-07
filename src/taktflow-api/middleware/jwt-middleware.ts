import type { FastifyRequest, FastifyReply } from 'fastify';

import { UnauthorizedException } from '@domain/exceptions/unauthorized-exception.js';

export async function jwtMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedException('Bearer token required');
  }

  const token = authHeader.slice(7);

  let payload: { sub: string; orgId: string };
  try {
    payload = await request.server.services.token.verifyAccessToken(token);
  } catch {
    throw new UnauthorizedException('Invalid or expired access token');
  }

  request.tenantId = payload.orgId;
  request.userId   = payload.sub;
}
