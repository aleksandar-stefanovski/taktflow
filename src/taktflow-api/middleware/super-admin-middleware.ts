import type { FastifyRequest, FastifyReply } from 'fastify';

import { UnauthorizedException } from '@domain/exceptions/unauthorized-exception.js';
import { TokenService } from '@infrastructure/auth/token-service.js';
import { authConfig } from '@api/config/auth.config.js';

const tokenService = new TokenService(
  authConfig.JWT_ACCESS_SECRET,
  authConfig.JWT_REFRESH_SECRET,
  authConfig.JWT_ACCESS_TOKEN_EXPIRY,
  authConfig.REFRESH_TOKEN_EXPIRY_DAYS,
);

export async function superAdminMiddleware(
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

  if (payload.role !== 'super_admin') {
    throw new UnauthorizedException('Super admin access required');
  }

  request.userId = payload.sub;
  request.role   = payload.role;
}
