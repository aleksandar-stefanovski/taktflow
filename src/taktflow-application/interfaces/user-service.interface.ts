import type { User, UserRole } from '@domain/entities/user.js';

export interface IUserService {
  create(request: {
    tenantId:  string;
    email:     string;
    password:  string;
    firstName: string;
    lastName:  string;
    role?:     UserRole;
  }): Promise<User>;
  getCurrent(userId: string, tenantId: string): Promise<User>;
  update(request: {
    userId:     string;
    tenantId:   string;
    firstName?: string;
    lastName?:  string;
  }): Promise<User>;
  delete(userId: string, tenantId: string): Promise<void>;
  changePassword(request: {
    userId:          string;
    tenantId:        string;
    currentPassword: string;
    newPassword:     string;
  }): Promise<void>;
}
