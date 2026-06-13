import type { DrizzleDb } from '@persistence/database.js';
import { EventRepository }          from '@persistence/repositories/event-repository.js';
import { TopicRepository }          from '@persistence/repositories/topic-repository.js';
import { ConsumerRepository }       from '@persistence/repositories/consumer-repository.js';
import { ScheduleRepository }       from '@persistence/repositories/schedule-repository.js';
import { ApiKeyRepository }         from '@persistence/repositories/api-key-repository.js';
import { UserRepository }           from '@persistence/repositories/user-repository.js';
import { TenantRepository }         from '@persistence/repositories/tenant-repository.js';
import { DeadLetterEventRepository } from '@persistence/repositories/dead-letter-event-repository.js';
import { EventDeliveryRepository }  from '@persistence/repositories/event-delivery-repository.js';

import type { ICurrentTenantProvider }   from '@domain/interfaces/current-tenant-provider.interface.js';
import type { ApplicationRepositories }  from '@api/interfaces/application-repositories.interface.js';

export function buildRepositories(
  db: DrizzleDb,
  tenantProvider: ICurrentTenantProvider,
): ApplicationRepositories {
  return {
    events:     new EventRepository(db, tenantProvider),
    topics:     new TopicRepository(db, tenantProvider),
    consumers:  new ConsumerRepository(db, tenantProvider),
    schedules:  new ScheduleRepository(db, tenantProvider),
    apiKeys:    new ApiKeyRepository(db, tenantProvider),
    users:      new UserRepository(db, tenantProvider),
    tenants:    new TenantRepository(db),
    dlq:        new DeadLetterEventRepository(db, tenantProvider),
    deliveries: new EventDeliveryRepository(db, tenantProvider),
  };
}
