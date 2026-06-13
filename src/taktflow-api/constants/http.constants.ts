export const HTTP_CONSTANTS = {
  API_KEY_HEADER: 'x-api-key',
} as const;

export const HTTP_STATUS = {
  OK:                200,
  CREATED:           201,
  NO_CONTENT:        204,
  BAD_REQUEST:       400,
  UNAUTHORIZED:      401,
  FORBIDDEN:         403,
  NOT_FOUND:         404,
  CONFLICT:          409,
  GONE:              410,
  UNPROCESSABLE:     422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL:          500,
} as const;
