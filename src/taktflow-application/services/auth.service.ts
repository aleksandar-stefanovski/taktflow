import type { ITenantRootRepository } from '@domain/interfaces/tenant-root-repository.interface.js';
import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';
import { Tenant } from '@domain/entities/tenant.js';
import { User } from '@domain/entities/user.js';
import { ConflictException } from '@domain/exceptions/conflict-exception.js';
import { UnauthorizedException } from '@domain/exceptions/unauthorized-exception.js';

import type { ITokenService } from '../interfaces/token-service.interface.js';
import type { IPasswordService } from '../interfaces/password-service.interface.js';
import type { LoginResult } from '../interfaces/login-result.interface.js';
import type { TokenPair } from '../interfaces/token-pair.interface.js';
import type { RegisterTenantRequest } from '../requests/tenants/register-tenant.request.js';

export class AuthService {
  constructor(
    private readonly tenants:               ITenantRootRepository,
    private readonly users:                 IUserRepository,
    private readonly passwords:             IPasswordService,
    private readonly tokens:               ITokenService,
    private readonly refreshTokenExpiryMs:  number,
  ) {}

  async register(request: RegisterTenantRequest): Promise<LoginResult> {
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

    const accessToken        = await this.tokens.signAccessToken({ sub: user.id, orgId: tenant.id });
    const refreshToken       = await this.tokens.signRefreshToken({ sub: user.id, orgId: tenant.id });
    const refreshTokenExpiry = new Date(Date.now() + this.refreshTokenExpiryMs);

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

  async login(request: { email: string; password: string }): Promise<LoginResult> {
    const user = await this.users.findByEmail(request.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.passwords.verify(user.passwordHash, request.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const accessToken        = await this.tokens.signAccessToken({ sub: user.id, orgId: user.tenantId });
    const refreshToken       = await this.tokens.signRefreshToken({ sub: user.id, orgId: user.tenantId });
    const refreshTokenExpiry = new Date(Date.now() + this.refreshTokenExpiryMs);

    await this.users.update(user.id, user.tenantId, {
      refreshToken,
      refreshTokenExpiry,
      lastLogin: new Date(),
    });

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

  async logout(request: { userId: string; tenantId: string }): Promise<void> {
    const user = await this.users.findById(request.userId, request.tenantId);
    if (!user) return;

    await this.users.update(user.id, user.tenantId, {
      refreshToken:       null,
      refreshTokenExpiry: null,
    });
  }

  async refresh(request: { refreshToken: string }): Promise<TokenPair> {
    const payload = await this.tokens.verifyRefreshToken(request.refreshToken);
    const user    = await this.users.findById(payload.sub, payload.orgId);

    if (!user || user.refreshToken !== request.refreshToken) {
      if (user) {
        await this.users.update(user.id, user.tenantId, {
          refreshToken:       null,
          refreshTokenExpiry: null,
        });
      }
      throw new UnauthorizedException('Refresh token invalid or reused');
    }

    const accessToken        = await this.tokens.signAccessToken({ sub: user.id, orgId: user.tenantId });
    const refreshToken       = await this.tokens.signRefreshToken({ sub: user.id, orgId: user.tenantId });
    const refreshTokenExpiry = new Date(Date.now() + this.refreshTokenExpiryMs);

    await this.users.update(user.id, user.tenantId, {
      refreshToken,
      refreshTokenExpiry,
    });

    return { accessToken, refreshToken };
  }
}
