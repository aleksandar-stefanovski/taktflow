import type { Pool } from 'pg';
import type { FastifyInstance } from 'fastify';

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

import { ProduceEventHandler } from '@application/commands/produce-event-handler.js';
import { CreateTopicHandler } from '@application/commands/create-topic-handler.js';
import { GetTopicHandler } from '@application/handlers/get-topic-handler.js';
import { UpdateTopicHandler } from '@application/handlers/update-topic-handler.js';
import { DeleteTopicHandler } from '@application/handlers/delete-topic-handler.js';
import { CreatePushConsumerHandler } from '@application/commands/create-push-consumer-handler.js';
import { CreatePullConsumerHandler } from '@application/commands/create-pull-consumer-handler.js';
import { CreateScheduleHandler } from '@application/commands/create-schedule-handler.js';
import { CreateApiKeyHandler } from '@application/commands/create-api-key-handler.js';
import { RegisterTenantHandler } from '@application/commands/register-tenant-handler.js';
import { ListEventsHandler } from '@application/queries/list-events-handler.js';
import { GetEventDetailHandler } from '@application/queries/get-event-detail-handler.js';
import { ListTopicsHandler } from '@application/queries/list-topics-handler.js';
import { ListConsumersHandler } from '@application/queries/list-consumers-handler.js';
import { ListSchedulesHandler } from '@application/queries/list-schedules-handler.js';
import { GetDashboardMetricsHandler } from '@application/queries/get-dashboard-metrics-handler.js';
import { ListApiKeysHandler } from '@application/queries/list-api-keys-handler.js';
import { GetApiKeyHandler } from '@application/queries/get-api-key-handler.js';
import { DeleteApiKeyHandler } from '@application/handlers/delete-api-key-handler.js';
import { LoginHandler } from '@application/handlers/login-handler.js';
import { RefreshTokenHandler } from '@application/handlers/refresh-token-handler.js';
import { LogoutHandler } from '@application/handlers/logout-handler.js';
import { CreateUserHandler } from '@application/handlers/create-user-handler.js';
import { GetCurrentUserHandler } from '@application/handlers/get-current-user-handler.js';
import { UpdateUserHandler } from '@application/handlers/update-user-handler.js';
import { ChangePasswordHandler } from '@application/handlers/change-password-handler.js';
import { ConsumeEventsHandler } from '@application/handlers/consume-events-handler.js';
import { GetTenantHandler } from '@application/handlers/get-tenant-handler.js';
import { UpdateTenantHandler } from '@application/handlers/update-tenant-handler.js';
import { GetUsageHandler } from '@application/handlers/get-usage-handler.js';
import { ListDeadLetterEventsHandler } from '@application/handlers/list-dead-letter-events-handler.js';
import { ReplayDeadLetterEventHandler } from '@application/handlers/replay-dead-letter-event-handler.js';
import { GetConsumerHealthHandler } from '@application/handlers/get-consumer-health-handler.js';
import { GetConsumerHandler } from '@application/handlers/get-consumer-handler.js';
import { UpdateConsumerHandler } from '@application/handlers/update-consumer-handler.js';
import { DeleteConsumerHandler } from '@application/handlers/delete-consumer-handler.js';
import { PauseConsumerHandler } from '@application/handlers/pause-consumer-handler.js';
import { ResumeConsumerHandler } from '@application/handlers/resume-consumer-handler.js';
import { AcknowledgeEventHandler } from '@application/handlers/acknowledge-event-handler.js';
import { UsageService } from '@application/handlers/usage-service.js';
import type { IUsageService } from '@application/interfaces/usage-service.interface.js';

import { TokenService } from '../infrastructure/auth/token-service.js';
import { PasswordService } from '../infrastructure/auth/password-service.js';

import type { ApplicationHandlers } from '../interfaces/application-handlers.interface.js';
import type { ApplicationRepositories } from '../interfaces/application-repositories.interface.js';
import type { ApplicationServices } from '../interfaces/application-services.interface.js';

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
  return new UsageService(new EventRepository(db), new TenantRepository(db));
}

function buildServices(): ApplicationServices {
  const token    = new TokenService();
  const password = new PasswordService();

  return { token, password };
}

function buildHandlers(
  db: DrizzleDb,
  repos: ApplicationRepositories,
  services: ApplicationServices,
  usage: IUsageService,
): ApplicationHandlers {
  const pool  = (db as unknown as { $client: Pool }).$client;
  const queue = new PostgresQueueEngine(pool);

  return {
    produceEvent:          new ProduceEventHandler(repos.events, repos.topics, repos.consumers, queue, usage),
    createTopic:           new CreateTopicHandler(repos.topics),
    getTopic:              new GetTopicHandler(repos.topics),
    updateTopic:           new UpdateTopicHandler(repos.topics),
    deleteTopic:           new DeleteTopicHandler(repos.topics),
    createPushConsumer:    new CreatePushConsumerHandler(repos.consumers, repos.topics),
    createPullConsumer:    new CreatePullConsumerHandler(repos.consumers, repos.topics),
    createSchedule:        new CreateScheduleHandler(repos.schedules, repos.topics),
    createApiKey:          new CreateApiKeyHandler(repos.apiKeys),
    listApiKeys:           new ListApiKeysHandler(repos.apiKeys),
    getApiKey:             new GetApiKeyHandler(repos.apiKeys),
    deleteApiKey:          new DeleteApiKeyHandler(repos.apiKeys),
    registerTenant:        new RegisterTenantHandler(new TenantRepository(db), repos.users, services.password, services.token),
    listEvents:            new ListEventsHandler(repos.events),
    getEventDetail:        new GetEventDetailHandler(repos.events),
    listTopics:            new ListTopicsHandler(repos.topics),
    listConsumers:         new ListConsumersHandler(repos.consumers),
    listSchedules:         new ListSchedulesHandler(repos.schedules),
    getDashboardMetrics:   new GetDashboardMetricsHandler(new TenantMetricsRepository(db)),
    login:                 new LoginHandler(repos.users, services.token, services.password),
    refresh:               new RefreshTokenHandler(repos.users, services.token),
    logout:                new LogoutHandler(repos.users),
    createUser:            new CreateUserHandler(repos.users, services.password),
    getCurrentUser:        new GetCurrentUserHandler(repos.users),
    updateUser:            new UpdateUserHandler(repos.users),
    changePassword:        new ChangePasswordHandler(repos.users, services.password),
    consumeEvents:         new ConsumeEventsHandler(repos.consumers, queue),
    getTenant:             new GetTenantHandler(repos.tenants),
    updateTenant:          new UpdateTenantHandler(repos.tenants),
    getUsage:              new GetUsageHandler(usage),
    listDeadLetterEvents:  new ListDeadLetterEventsHandler(repos.dlq),
    replayDeadLetterEvent: new ReplayDeadLetterEventHandler(repos.dlq, repos.consumers, queue),
    getConsumerHealth:     new GetConsumerHealthHandler(repos.consumers, repos.deliveries),
    getConsumer:           new GetConsumerHandler(repos.consumers),
    updateConsumer:        new UpdateConsumerHandler(repos.consumers),
    deleteConsumer:        new DeleteConsumerHandler(repos.consumers),
    pauseConsumer:         new PauseConsumerHandler(repos.consumers),
    resumeConsumer:        new ResumeConsumerHandler(repos.consumers),
    acknowledgeEvent:      new AcknowledgeEventHandler(repos.deliveries, repos.consumers, queue),
  };
}

export async function registerApiDependencies(
  app: FastifyInstance,
  db: DrizzleDb,
): Promise<void> {
  const repos    = buildRepositories(db);
  const usage    = buildUsageService(db);
  const services = buildServices();
  const handlers = buildHandlers(db, repos, services, usage);

  app.decorate('repos',    repos);
  app.decorate('services', services);
  app.decorate('handlers', handlers);
}
