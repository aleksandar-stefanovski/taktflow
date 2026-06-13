import type { IAuthService }       from '@taktflow/application/interfaces/auth-service.interface.js';
import type { IApiKeyService }     from '@taktflow/application/interfaces/api-key-service.interface.js';
import type { IConsumerService }   from '@taktflow/application/interfaces/consumer-service.interface.js';
import type { IDashboardService }  from '@taktflow/application/interfaces/dashboard-service.interface.js';
import type { IDeadLetterService } from '@taktflow/application/interfaces/dead-letter-service.interface.js';
import type { IEventService }      from '@taktflow/application/interfaces/event-service.interface.js';
import type { IScheduleService }   from '@taktflow/application/interfaces/schedule-service.interface.js';
import type { ITenantService }     from '@taktflow/application/interfaces/tenant-service.interface.js';
import type { ITopicService }      from '@taktflow/application/interfaces/topic-service.interface.js';
import type { IUserService }       from '@taktflow/application/interfaces/user-service.interface.js';

export interface ApplicationDomainServices {
  apiKey:     IApiKeyService;
  auth:       IAuthService;
  consumers:  IConsumerService;
  deadLetter: IDeadLetterService;
  events:     IEventService;
  dashboard:  IDashboardService;
  schedules:  IScheduleService;
  tenants:    ITenantService;
  topics:     ITopicService;
  users:      IUserService;
}
