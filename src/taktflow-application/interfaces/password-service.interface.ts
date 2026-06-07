export interface IPasswordService {
  hash(password: string): Promise<string>;
  verify(hash: string, password: string): Promise<boolean>;
}
