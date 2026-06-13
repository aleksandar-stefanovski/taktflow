import type { IEventRepository }           from '@taktflow/domain/interfaces/event-repository.interface.js';
import type { ITopicRepository }           from '@taktflow/domain/interfaces/topic-repository.interface.js';
import type { IConsumerRepository }        from '@taktflow/domain/interfaces/consumer-repository.interface.js';
import type { IScheduleRepository }        from '@taktflow/domain/interfaces/schedule-repository.interface.js';
import type { IApiKeyRepository }          from '@taktflow/domain/interfaces/api-key-repository.interface.js';
import type { IUserRepository }            from '@taktflow/domain/interfaces/user-repository.interface.js';
import type { ITenantRootRepository }      from '@taktflow/domain/interfaces/tenant-root-repository.interface.js';
import type { IDeadLetterEventRepository } from '@taktflow/domain/interfaces/dead-letter-event-repository.interface.js';
import type { IEventDeliveryRepository }   from '@taktflow/domain/interfaces/event-delivery-repository.interface.js';

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
