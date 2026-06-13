import type { LoginResponse }        from '../responses/auth/login.response.js';
import type { RefreshTokenResponse }  from '../responses/auth/refresh-token.response.js';
import type { RegisterTenantRequest } from '../requests/tenants/register-tenant.request.js';

export interface IAuthService {
  register(request: RegisterTenantRequest): Promise<LoginResponse>;
  login(request: { email: string; password: string }): Promise<LoginResponse>;
  logout(request: { userId: string; tenantId: string | null }): Promise<void>;
  reactivateTenant(request: { email: string; password: string }): Promise<LoginResponse>;
  refresh(request: { refreshToken: string }): Promise<RefreshTokenResponse>;
}
