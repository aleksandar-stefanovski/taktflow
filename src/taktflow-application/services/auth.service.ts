import type { ITenantRootRepository } from '@taktflow/domain/interfaces/tenant-root-repository.interface.js';
import type { IUserRootRepository } from '@taktflow/domain/interfaces/user-root-repository.interface.js';
import { Tenant } from '@taktflow/domain/entities/tenant.js';
import { User } from '@taktflow/domain/entities/user.js';
import { EntityKey } from '@taktflow/domain/entities/entity-key.js';
import { ConflictException } from '@taktflow/domain/exceptions/conflict-exception.js';
import { NotFoundException } from '@taktflow/domain/exceptions/not-found-exception.js';
import { UnauthorizedException } from '@taktflow/domain/exceptions/unauthorized-exception.js';
import { TenantDeletedException } from '@taktflow/domain/exceptions/tenant-deleted-exception.js';

import type { ITokenService }    from '../contracts/token-service.interface.js';
import type { IPasswordService } from '../contracts/password-service.interface.js';
import type { IAuthService }     from '../interfaces/auth-service.interface.js';
import type { RegisterTenantRequest } from '../requests/tenants/register-tenant.request.js';
import { LoginResponse } from '../responses/auth/login.response.js';
import { RefreshTokenResponse } from '../responses/auth/refresh-token.response.js';

export class AuthService implements IAuthService {
  constructor(
    private readonly tenants:               ITenantRootRepository,
    private readonly users:                 IUserRootRepository,
    private readonly passwords:             IPasswordService,
    private readonly tokens:               ITokenService,
    private readonly refreshTokenExpiryMs:  number,
    private readonly gracePeriodDays:       number,
  ) {}

  async register(request: RegisterTenantRequest): Promise<LoginResponse> {
    const existing = await this.users.findByEmail(request.email);
    if (existing) throw new ConflictException(`Email ${request.email} is already registered`);

    const tenant = await this.tenants.create(new Tenant({
      key:  EntityKey.create(null),
      name: request.name,
      ...(request.plan !== undefined && { plan: request.plan }),
    }));

    const passwordHash = await this.passwords.hash(request.password);
    const user = await this.users.create(new User({
      key:       EntityKey.create(tenant.id),
      email:     request.email,
      passwordHash,
      firstName: request.firstName,
      lastName:  request.lastName,
      role:      'owner',
    }));

    const accessToken        = await this.tokens.signAccessToken({ sub: user.id, orgId: tenant.id, role: user.role });
    const refreshToken       = await this.tokens.signRefreshToken({ sub: user.id, orgId: tenant.id, role: user.role });
    const refreshTokenExpiry = new Date(Date.now() + this.refreshTokenExpiryMs);

    await this.users.update(user.id, { refreshToken, refreshTokenExpiry });

    return LoginResponse.mapFromEntity({ accessToken, refreshToken, user });
  }

  async login(request: { email: string; password: string }): Promise<LoginResponse> {
    const user = await this.users.findByEmail(request.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.passwords.verify(user.passwordHash, request.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const accessToken        = await this.tokens.signAccessToken({ sub: user.id, orgId: user.key.tenantId ?? undefined, role: user.role });
    const refreshToken       = await this.tokens.signRefreshToken({ sub: user.id, orgId: user.key.tenantId ?? undefined, role: user.role });
    const refreshTokenExpiry = new Date(Date.now() + this.refreshTokenExpiryMs);

    await this.users.update(user.id, {
      refreshToken,
      refreshTokenExpiry,
      lastLogin: new Date(),
    });

    return LoginResponse.mapFromEntity({ accessToken, refreshToken, user });
  }

  async logout(request: { userId: string; tenantId: string | null }): Promise<void> {
    const user = await this.users.findById(request.userId);
    if (!user) return;

    await this.users.update(user.id, {
      refreshToken:       null,
      refreshTokenExpiry: null,
    });
  }

  async reactivateTenant(request: { email: string; password: string }): Promise<LoginResponse> {
    const user = await this.users.findByEmail(request.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.passwords.verify(user.passwordHash, request.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const tenantId = user.key.tenantId;
    if (!tenantId) throw new UnauthorizedException('User has no associated tenant');

    const tenant = await this.tenants.findByIdIncludingDeleted(tenantId);
    if (!tenant) throw new NotFoundException('Tenant', tenantId);

    if (tenant.deletedAt !== null) {
      const gracePeriodMs = this.gracePeriodDays * 24 * 60 * 60 * 1000;
      const expiresAt     = new Date(tenant.deletedAt.getTime() + gracePeriodMs);
      if (new Date() > expiresAt) {
        throw new TenantDeletedException('The reactivation window has expired. Your account data has been permanently deleted.');
      }
      await this.tenants.reactivate(tenantId);
    }

    const accessToken        = await this.tokens.signAccessToken({ sub: user.id, orgId: tenantId, role: user.role });
    const refreshToken       = await this.tokens.signRefreshToken({ sub: user.id, orgId: tenantId, role: user.role });
    const refreshTokenExpiry = new Date(Date.now() + this.refreshTokenExpiryMs);

    await this.users.update(user.id, { refreshToken, refreshTokenExpiry, lastLogin: new Date() });

    return LoginResponse.mapFromEntity({ accessToken, refreshToken, user });
  }

  async refresh(request: { refreshToken: string }): Promise<RefreshTokenResponse> {
    const payload = await this.tokens.verifyRefreshToken(request.refreshToken);
    const user    = await this.users.findById(payload.sub);

    if (!user || user.refreshToken !== request.refreshToken) {
      if (user) {
        await this.users.update(user.id, {
          refreshToken:       null,
          refreshTokenExpiry: null,
        });
      }
      throw new UnauthorizedException('Refresh token invalid or reused');
    }

    const accessToken        = await this.tokens.signAccessToken({ sub: user.id, orgId: user.key.tenantId ?? undefined, role: user.role });
    const refreshToken       = await this.tokens.signRefreshToken({ sub: user.id, orgId: user.key.tenantId ?? undefined, role: user.role });
    const refreshTokenExpiry = new Date(Date.now() + this.refreshTokenExpiryMs);

    await this.users.update(user.id, {
      refreshToken,
      refreshTokenExpiry,
    });

    return RefreshTokenResponse.mapFromEntity({ accessToken, refreshToken });
  }
}
