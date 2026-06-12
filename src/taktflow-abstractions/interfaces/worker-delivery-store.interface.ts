export interface IWorkerDeliveryStore {
  resetTimedOutAcks(awaitingAckTimeoutHours: number): Promise<void>;
  releaseStuckDeliveries(stuckThresholdMs: number): Promise<number>;
}
