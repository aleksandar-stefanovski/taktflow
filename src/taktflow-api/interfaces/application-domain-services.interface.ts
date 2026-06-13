import type { IAuthService }       from '@application/interfaces/auth-service.interface.js';
import type { IApiKeyService }     from '@application/interfaces/api-key-service.interface.js';
import type { IConsumerService }   from '@application/interfaces/consumer-service.interface.js';
import type { IDashboardService }  from '@application/interfaces/dashboard-service.interface.js';
import type { IDeadLetterService } from '@application/interfaces/dead-letter-service.interface.js';
import type { IEventService }      from '@application/interfaces/event-service.interface.js';
import type { IScheduleService }   from '@application/interfaces/schedule-service.interface.js';
import type { ITenantService }     from '@application/interfaces/tenant-service.interface.js';
import type { ITopicService }      from '@application/interfaces/topic-service.interface.js';
import type { IUserService }       from '@application/interfaces/user-service.interface.js';

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
