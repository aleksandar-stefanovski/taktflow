import { z } from 'zod';

export const CreateUserSchema = z.object({
  email:     z.string().email(),
  password:  z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName:  z.string().min(1).max(100),
  role:      z.enum(['admin', 'member']).optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName:  z.string().min(1).max(100).optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword:     z.string().min(8),
});

export const UserResponseSchema = z.object({
  id:        z.string().uuid(),
  tenantId:  z.string().uuid(),
  email:     z.string().email(),
  firstName: z.string(),
  lastName:  z.string(),
  role:      z.string(),
  lastLogin: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
