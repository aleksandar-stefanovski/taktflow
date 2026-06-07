import type { ApiKeyService } from '@application/services/api-key.service.js';
import type { AuthService } from '@application/services/auth.service.js';
import type { ConsumerService } from '@application/services/consumer.service.js';
import type { DeadLetterService } from '@application/services/dead-letter.service.js';
import type { EventService } from '@application/services/event.service.js';
import type { DashboardService } from '@application/services/dashboard.service.js';
import type { ScheduleService } from '@application/services/schedule.service.js';
import type { TenantService } from '@application/services/tenant.service.js';
import type { TopicService } from '@application/services/topic.service.js';
import type { UserService } from '@application/services/user.service.js';

export interface ApplicationDomainServices {
  apiKey:     ApiKeyService;
  auth:       AuthService;
  consumers:  ConsumerService;
  deadLetter: DeadLetterService;
  events:     EventService;
  dashboard:  DashboardService;
  schedules:  ScheduleService;
  tenants:    TenantService;
  topics:     TopicService;
  users:      UserService;
}
