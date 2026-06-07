import type { ITenantRootRepository } from '@domain/interfaces/tenant-root-repository.interface.js';
import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';
import { Tenant } from '@domain/entities/tenant.js';
import { User } from '@domain/entities/user.js';
import { ConflictException } from '@domain/exceptions/conflict-exception.js';

import type { ITokenService } from '../interfaces/token-service.interface.js';
import type { IPasswordService } from '../interfaces/password-service.interface.js';
import type { LoginResult } from '../interfaces/login-result.interface.js';
import type { RegisterTenantRequest } from '../requests/tenants/register-tenant.request.js';

const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export class RegisterTenantHandler {
  constructor(
    private readonly tenants: ITenantRootRepository,
    private readonly users: IUserRepository,
    private readonly passwords: IPasswordService,
    private readonly tokens: ITokenService,
  ) {}

  async handle(request: RegisterTenantRequest): Promise<LoginResult> {
    const existing = await this.users.findByEmail(request.email);
    if (existing) throw new ConflictException(`Email ${request.email} is already registered`);

    const tenant = await this.tenants.create(new Tenant({
      name: request.name,
      ...(request.plan !== undefined && { plan: request.plan }),
    }));

    const passwordHash = await this.passwords.hash(request.password);
    const user = await this.users.create(new User({
      tenantId:  tenant.id,
      email:     request.email,
      passwordHash,
      firstName: request.firstName,
      lastName:  request.lastName,
      role:      'owner',
    }));

    const accessToken  = await this.tokens.signAccessToken({ sub: user.id, orgId: tenant.id });
    const refreshToken = await this.tokens.signRefreshToken({ sub: user.id, orgId: tenant.id });
    const refreshTokenExpiry = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    await this.users.update(user.id, tenant.id, { refreshToken, refreshTokenExpiry });

    return {
      accessToken,
      refreshToken,
      user: {
        id:        user.id,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role,
      },
    };
  }
}
