export interface ICleanupService {
  start(): void;
  stop(): Promise<void>;
}
