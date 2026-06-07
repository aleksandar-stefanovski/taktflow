import type { Pool } from 'pg';
import type { FastifyInstance } from 'fastify';

import { authConfig }     from '@api/config/auth.config.js';
import { serverConfig }   from '@api/config/server.config.js';
import { plansConfig }    from '@api/config/plans.config.js';
import { defaultsConfig } from '@api/config/defaults.config.js';

import type { DrizzleDb } from '@persistence/database.js';
import { EventRepository } from '@persistence/repositories/event-repository.js';
import { TopicRepository } from '@persistence/repositories/topic-repository.js';
import { ConsumerRepository } from '@persistence/repositories/consumer-repository.js';
import { ScheduleRepository } from '@persistence/repositories/schedule-repository.js';
import { ApiKeyRepository } from '@persistence/repositories/api-key-repository.js';
import { UserRepository } from '@persistence/repositories/user-repository.js';
import { TenantRepository } from '@persistence/repositories/tenant-repository.js';
import { TenantMetricsRepository } from '@persistence/repositories/tenant-metrics-repository.js';
import { DeadLetterEventRepository } from '@persistence/repositories/dead-letter-event-repository.js';
import { EventDeliveryRepository } from '@persistence/repositories/event-delivery-repository.js';

import { PostgresQueueEngine } from '@infrastructure/queue/postgres-queue-engine.js';

import { ApiKeyService } from '@application/services/api-key.service.js';
import { AuthService } from '@application/services/auth.service.js';
import { ConsumerService } from '@application/services/consumer.service.js';
import { DeadLetterService } from '@application/services/dead-letter.service.js';
import { EventService } from '@application/services/event.service.js';
import { DashboardService } from '@application/services/dashboard.service.js';
import { ScheduleService } from '@application/services/schedule.service.js';
import { TenantService } from '@application/services/tenant.service.js';
import { TopicService } from '@application/services/topic.service.js';
import { UserService } from '@application/services/user.service.js';
import { UsageService } from '@application/services/usage.service.js';
import type { IUsageService } from '@application/interfaces/usage-service.interface.js';

import { TokenService } from '@infrastructure/auth/token-service.js';
import { PasswordService } from '@infrastructure/auth/password-service.js';

import type { ApplicationDomainServices } from '@api/interfaces/application-domain-services.interface.js';
import type { ApplicationRepositories } from '@api/interfaces/application-repositories.interface.js';

function buildRepositories(db: DrizzleDb): ApplicationRepositories {
  return {
    events:     new EventRepository(db),
    topics:     new TopicRepository(db),
    consumers:  new ConsumerRepository(db),
    schedules:  new ScheduleRepository(db),
    apiKeys:    new ApiKeyRepository(db),
    users:      new UserRepository(db),
    tenants:    new TenantRepository(db),
    dlq:        new DeadLetterEventRepository(db),
    deliveries: new EventDeliveryRepository(db),
  };
}

function buildUsageService(db: DrizzleDb): IUsageService {
  return new UsageService(new EventRepository(db), new TenantRepository(db), {
    starter:    plansConfig.PLAN_STARTER_EVENTS_PER_MONTH,
    growth:     plansConfig.PLAN_GROWTH_EVENTS_PER_MONTH,
    business:   plansConfig.PLAN_BUSINESS_EVENTS_PER_MONTH,
    enterprise: plansConfig.PLAN_ENTERPRISE_EVENTS_PER_MONTH,
  });
}

function buildDomainServices(
  db: DrizzleDb,
  repos: ApplicationRepositories,
  usage: IUsageService,
): ApplicationDomainServices {
  const pool      = (db as unknown as { $client: Pool }).$client;
  const queue     = new PostgresQueueEngine(pool);
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
    auth:       new AuthService(repos.tenants, repos.users, passwords, tokens, authConfig.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    consumers:  new ConsumerService(repos.consumers, repos.topics, repos.deliveries, queue, plansConfig.RETRY_BASE_DELAY_MS, {
      timeoutMs:           defaultsConfig.CONSUMER_DEFAULT_TIMEOUT_MS,
      retryAttempts:       defaultsConfig.CONSUMER_DEFAULT_RETRY_ATTEMPTS,
      retryBackoff:        defaultsConfig.CONSUMER_DEFAULT_RETRY_BACKOFF,
      retryInitialDelayMs: defaultsConfig.CONSUMER_DEFAULT_RETRY_INITIAL_DELAY_MS,
      alertAfterFailures:  defaultsConfig.CONSUMER_DEFAULT_ALERT_AFTER_FAILURES,
      alertEmail:          null,
      maxConcurrent:       defaultsConfig.CONSUMER_DEFAULT_MAX_CONCURRENT,
    }),
    deadLetter: new DeadLetterService(repos.dlq, repos.consumers, queue),
    events:     new EventService(repos.events, repos.topics, repos.consumers, queue, usage),
    dashboard:  new DashboardService(new TenantMetricsRepository(db)),
    schedules:  new ScheduleService(repos.schedules, repos.topics),
    tenants:    new TenantService(repos.tenants, usage),
    topics:     new TopicService(repos.topics, {
      retentionDays: defaultsConfig.TOPIC_DEFAULT_RETENTION_DAYS,
      maxPayloadKb:  defaultsConfig.TOPIC_DEFAULT_MAX_PAYLOAD_KB,
      ordering:      defaultsConfig.TOPIC_DEFAULT_ORDERING,
    }),
    users:      new UserService(repos.users, passwords),
  };
}

export async function registerApiDependencies(
  app: FastifyInstance,
  db: DrizzleDb,
): Promise<void> {
  const repos    = buildRepositories(db);
  const usage    = buildUsageService(db);
  const services = buildDomainServices(db, repos, usage);

  app.decorate('repos',    repos);
  app.decorate('services', services);
}
