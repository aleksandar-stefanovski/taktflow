import { createHash, randomUUID } from 'node:crypto';
import CronParser from 'cron-parser';
import { tenantContextStore } from '@taktflow/infra/context/tenant-context-store.js';

import type { IScheduleRepository } from '@taktflow/domain/interfaces/schedule-repository.interface.js';
import type { IEventRepository }    from '@taktflow/domain/interfaces/event-repository.interface.js';
import type { IConsumerRepository } from '@taktflow/domain/interfaces/consumer-repository.interface.js';
import type { IEventQueueService }  from '@taktflow/domain/interfaces/event-queue-service.interface.js';
import type { LoggerMessages }      from '../extensions/logger-message.extension.js';
import type { WorkerConfig }        from '../config/worker.config.js';
import type { ISchedulerService }   from '../interfaces/scheduler-service.interface.js';
import type { Schedule }            from '@taktflow/domain/entities/schedule.js';
import { Event }                    from '@taktflow/domain/entities/event.js';
import { EntityKey }                from '@taktflow/domain/entities/entity-key.js';
import { RecurringTask }            from '../helpers/recurring-task.helper.js';

export class SchedulerService implements ISchedulerService {
  private readonly task: RecurringTask;

  constructor(
    private readonly schedules: IScheduleRepository,
    private readonly events:    IEventRepository,
    private readonly consumers: IConsumerRepository,
    private readonly queue:     IEventQueueService,
    private readonly logger:    LoggerMessages,
    private readonly config:    WorkerConfig,
  ) {
    this.task = new RecurringTask(
      this.config.WORKER_SCHEDULER_INTERVAL_MS,
      () => this.processDueSchedules(new Date()),
      error => this.logger.logWorkerLoopError('scheduler', error),
    );
  }

  start(): void {
    this.task.start();
  }

  stop(): Promise<void> {
    return this.task.stop();
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
          key:     EntityKey.create(schedule.key.tenantId),
          topicId: schedule.topicId,
          payload: schedule.payload,
          checksum,
          source:  'api',
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
              id:          randomUUID(),
              eventId:     event.id,
              tenantId:    schedule.key.tenantId!,
              topicId:     schedule.topicId,
              consumerId:  consumer.id,
              payload:     schedule.payload,
              attempt:     0,
              scheduledAt: firedAt,
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
