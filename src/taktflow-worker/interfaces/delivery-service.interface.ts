export interface IDeliveryService {
  start(): void;
  stop(): void;
  waitForDrain(): Promise<void>;
}
