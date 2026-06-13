import { createHash } from 'node:crypto';
import CronParser from 'cron-parser';
import { tenantContextStore } from '@infrastructure/context/tenant-context-store.js';

import type { IScheduleRepository } from '@domain/interfaces/schedule-repository.interface.js';
import type { IEventRepository }    from '@domain/interfaces/event-repository.interface.js';
import type { IConsumerRepository } from '@domain/interfaces/consumer-repository.interface.js';
import type { IEventQueueService }  from '@domain/interfaces/event-queue-service.interface.js';
import type { LoggerMessages }      from '../extensions/logger-message.extension.js';
import type { WorkerConfig }        from '../config/worker.config.js';
import type { ISchedulerService }   from '../interfaces/scheduler-service.interface.js';
import type { Schedule }            from '@domain/entities/schedule.js';
import { Event }                    from '@domain/entities/event.js';
import { EntityKey }                from '@domain/entities/entity-key.js';

export class SchedulerService implements ISchedulerService {
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(
    private readonly schedules:  IScheduleRepository,
    private readonly events:     IEventRepository,
    private readonly consumers:  IConsumerRepository,
    private readonly queue:      IEventQueueService,
    private readonly logger:     LoggerMessages,
    private readonly config:     WorkerConfig,
  ) {}

  start(): void {
    this.intervalHandle = setInterval(() => {
      void this.processDueSchedules(new Date()).catch((error: unknown) => {
        this.logger.logWorkerLoopError('scheduler', error as Error);
      });
    }, this.config.WORKER_SCHEDULER_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private async processDueSchedules(now: Date): Promise<void> {
    const dueSchedules = await this.schedules.findDue(now, this.config.WORKER_SCHEDULER_BATCH_SIZE);
    if (!dueSchedules.length) return;

    await Promise.all(dueSchedules.map(schedule => this.fire(schedule, now)));
  }

  private async fire(schedule: Schedule, firedAt: Date): Promise<void> {
    try {
      await tenantContextStore.run({ tenantId: schedule.key.tenantId ?? undefined }, async () => {
        const checksum = createHash('sha256')
          .update(JSON.stringify(schedule.payload))
          .digest('hex');

        const event = new Event({
          key:      EntityKey.create(schedule.key.tenantId),
          topicId:  schedule.topicId,
          payload:  schedule.payload,
          checksum,
          source:   'api',
        });

        await this.events.create(event);

        const consumers = await this.consumers.findByTopicId(
          schedule.topicId,
          this.config.WORKER_SCHEDULER_CONSUMER_LIMIT,
          0,
        );

        await Promise.all(
          consumers.map(consumer =>
            this.queue.enqueue({
              id:          crypto.randomUUID(),
              eventId:     event.id,
              tenantId:    schedule.key.tenantId!,
              topicId:     schedule.topicId,
              consumerId:  consumer.id,
              payload:     schedule.payload,
              attempt:     0,
              scheduledAt: new Date(),
            }),
          ),
        );

        const nextRun = CronParser.parseExpression(schedule.cron).next().toDate();
        await this.schedules.update(schedule.id, {
          lastRun: firedAt,
          nextRun,
        });

        this.logger.logSchedulerFired(schedule.id, schedule.topicId, schedule.cron);
      });

    } catch (error) {
      this.logger.logSchedulerError(schedule.id, error as Error);
    }
  }
}
