import { z } from 'zod';

import {
  CreateUserSchema,
  UpdateUserSchema,
  ChangePasswordSchema,
} from '@application/validators/user-validators.js';
import { zodToJsonSchema, ErrorResponseSchema } from '@api/swagger/api-schemas.js';

const UserSchema = z.object({
  id:        z.string().uuid(),
  tenantId:  z.string().uuid().nullable(),
  email:     z.string().email(),
  firstName: z.string(),
  lastName:  z.string(),
  role:      z.string(),
  lastLogin: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const userSchemas = {
  create: {
    tags:    ['Users'],
    summary: 'Create a user in the current tenant',
    body:    zodToJsonSchema(CreateUserSchema),
    response: {
      201: zodToJsonSchema(UserSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      409: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  getMe: {
    tags:    ['Users'],
    summary: 'Get current user profile',
    response: {
      200: zodToJsonSchema(UserSchema),
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  updateMe: {
    tags:    ['Users'],
    summary: 'Update current user profile',
    body:    zodToJsonSchema(UpdateUserSchema),
    response: {
      200: zodToJsonSchema(UserSchema),
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  changePassword: {
    tags:    ['Users'],
    summary: 'Change current user password',
    body:    zodToJsonSchema(ChangePasswordSchema),
    response: {
      204: { type: 'null', description: 'Password changed' },
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
  deleteMe: {
    tags:    ['Users'],
    summary: 'Delete and anonymize the current user account',
    response: {
      204: { type: 'null', description: 'Account deleted' },
      401: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
    },
  },
};
