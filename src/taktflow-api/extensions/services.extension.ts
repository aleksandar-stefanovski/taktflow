import { authConfig }    from '@api/config/auth.config.js';
import { plansConfig }   from '@api/config/plans.config.js';
import { defaultsConfig } from '@api/config/defaults.config.js';
import { serverConfig }  from '@api/config/server.config.js';

import type { DrizzleDb } from '@persistence/database.js';
import { UserRootRepository }      from '@persistence/repositories/user-root-repository.js';
import { TenantMetricsRepository } from '@persistence/repositories/tenant-metrics-repository.js';

import { PostgresQueueEngine } from '@persistence/queue/postgres-queue-engine.js';
import { TokenService }        from '@infrastructure/auth/token-service.js';
import { PasswordService }     from '@infrastructure/auth/password-service.js';

import { ApiKeyService }     from '@application/services/api-key.service.js';
import { AuthService }       from '@application/services/auth.service.js';
import { ConsumerService }   from '@application/services/consumer.service.js';
import { DeadLetterService } from '@application/services/dead-letter.service.js';
import { EventService }      from '@application/services/event.service.js';
import { DashboardService }  from '@application/services/dashboard.service.js';
import { ScheduleService }   from '@application/services/schedule.service.js';
import { TenantService }     from '@application/services/tenant.service.js';
import { TopicService }      from '@application/services/topic.service.js';
import { UserService }       from '@application/services/user.service.js';
import type { IUsageService } from '@application/interfaces/usage-service.interface.js';

import type { ApplicationRepositories }   from '@api/interfaces/application-repositories.interface.js';
import type { ApplicationDomainServices } from '@api/interfaces/application-domain-services.interface.js';

export function buildDomainServices(
  db: DrizzleDb,
  repos: ApplicationRepositories,
  usage: IUsageService,
): ApplicationDomainServices {
  const queue     = new PostgresQueueEngine(db);
  const tokens    = new TokenService(
    authConfig.JWT_ACCESS_SECRET,
    authConfig.JWT_REFRESH_SECRET,
    authConfig.JWT_ACCESS_TOKEN_EXPIRY,
    authConfig.REFRESH_TOKEN_EXPIRY_DAYS,
  );
  const passwords = new PasswordService(
    authConfig.ARGON2_MEMORY_COST,
    authConfig.ARGON2_TIME_COST,
    authConfig.ARGON2_PARALLELISM,
  );

  return {
    apiKey:     new ApiKeyService(repos.apiKeys, authConfig.API_KEY_PREFIX),
    auth:       new AuthService(repos.tenants, new UserRootRepository(db), passwords, tokens, authConfig.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000, serverConfig.TENANT_DELETION_GRACE_PERIOD_DAYS),
    consumers:  new ConsumerService(repos.consumers, repos.topics, repos.deliveries, queue, plansConfig.RETRY_BASE_DELAY_MS, plansConfig.RETRY_MAX_ATTEMPTS),
    deadLetter: new DeadLetterService(repos.dlq, repos.consumers, queue),
    events:     new EventService(repos.events, repos.topics, repos.consumers, queue, usage),
    dashboard:  new DashboardService(new TenantMetricsRepository(db)),
    schedules:  new ScheduleService(repos.schedules, repos.topics),
    tenants:    new TenantService(repos.tenants, usage),
    topics:     new TopicService(repos.topics, {
      retentionDays: defaultsConfig.TOPIC_DEFAULT_RETENTION_DAYS,
      maxPayloadBytes: defaultsConfig.TOPIC_DEFAULT_MAX_PAYLOAD_BYTES,
      ordering:      defaultsConfig.TOPIC_DEFAULT_ORDERING,
    }),
    users:      new UserService(repos.users, passwords),
  };
}
