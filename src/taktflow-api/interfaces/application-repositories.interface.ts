import type { IEventRepository } from '@domain/interfaces/event-repository.interface.js';
import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { IScheduleRepository } from '@domain/interfaces/schedule-repository.interface.js';
import type { IApiKeyRepository } from '@domain/interfaces/api-key-repository.interface.js';
import type { IUserRepository } from '@domain/interfaces/user-repository.interface.js';
import type { ITenantRootRepository } from '@domain/interfaces/tenant-root-repository.interface.js';
import type { IDeadLetterEventRepository } from '@domain/interfaces/dead-letter-event-repository.interface.js';
import type { IEventDeliveryRepository } from '@domain/interfaces/event-delivery-repository.interface.js';

export interface ApplicationRepositories {
  events:     IEventRepository;
  topics:     ITopicRepository;
  consumers:  IConsumerRepository;
  schedules:  IScheduleRepository;
  apiKeys:    IApiKeyRepository;
  users:      IUserRepository;
  tenants:    ITenantRootRepository;
  dlq:        IDeadLetterEventRepository;
  deliveries: IEventDeliveryRepository;
}
