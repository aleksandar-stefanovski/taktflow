import { randomBytes, createHash } from 'node:crypto';

import { API_KEY_PREFIX } from '@types/api-key-constants.js';

export class ApiKeyValue {
  readonly raw: string;
  readonly hash: string;
  readonly prefix: string;

  private constructor(raw: string, hash: string, prefix: string) {
    this.raw = raw;
    this.hash = hash;
    this.prefix = prefix;
  }

  static generate(): ApiKeyValue {
    const raw = `${API_KEY_PREFIX}${randomBytes(32).toString('hex')}`;
    const hash = createHash('sha256').update(raw).digest('hex');
    const prefix = raw.substring(0, 16);
    return new ApiKeyValue(raw, hash, prefix);
  }
}
