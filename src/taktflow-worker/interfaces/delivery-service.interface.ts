export interface IDeliveryService {
  start(): void;
  stop(): Promise<void>;
}
