import argon2 from 'argon2';

export class PasswordService {
  constructor(
    private readonly memoryCost:  number,
    private readonly timeCost:    number,
    private readonly parallelism: number,
  ) {}

  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type:        argon2.argon2id,
      memoryCost:  this.memoryCost,
      timeCost:    this.timeCost,
      parallelism: this.parallelism,
    });
  }

  async verify(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
