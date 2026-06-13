import type { DrizzleDb } from '@taktflow/persistence/database.js';
import { EventRepository }          from '@taktflow/persistence/repositories/event-repository.js';
import { TopicRepository }          from '@taktflow/persistence/repositories/topic-repository.js';
import { ConsumerRepository }       from '@taktflow/persistence/repositories/consumer-repository.js';
import { ScheduleRepository }       from '@taktflow/persistence/repositories/schedule-repository.js';
import { ApiKeyRepository }         from '@taktflow/persistence/repositories/api-key-repository.js';
import { UserRepository }           from '@taktflow/persistence/repositories/user-repository.js';
import { TenantRepository }         from '@taktflow/persistence/repositories/tenant-repository.js';
import { DeadLetterEventRepository } from '@taktflow/persistence/repositories/dead-letter-event-repository.js';
import { EventDeliveryRepository }  from '@taktflow/persistence/repositories/event-delivery-repository.js';

import type { ICurrentTenantProvider }   from '@taktflow/domain/interfaces/current-tenant-provider.interface.js';
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
