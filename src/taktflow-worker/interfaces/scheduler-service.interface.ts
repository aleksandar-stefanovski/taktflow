export interface ISchedulerService {
  start(): void;
  stop(): Promise<void>;
}
