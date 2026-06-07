import { createHash } from 'crypto';
import CronParser from 'cron-parser';

import type { WorkerDependencies } from '../interfaces/worker-dependencies.interface.js';
import type { Schedule } from '@domain/entities/schedule.js';
import { Event } from '@domain/entities/event.js';

export class SchedulerService {
  constructor(private readonly deps: WorkerDependencies) {}

  async processDueSchedules(now: Date): Promise<void> {
    const dueSchedules = await this.deps.schedules.findDue(
      now,
      this.deps.config.schedulerBatchSize,
    );
    if (!dueSchedules.length) return;

    await Promise.all(dueSchedules.map(schedule => this.fire(schedule, now)));
  }

  private async fire(schedule: Schedule, firedAt: Date): Promise<void> {
    try {
      const checksum = createHash('sha256')
        .update(JSON.stringify(schedule.payload))
        .digest('hex');

      const event = new Event({
        tenantId: schedule.tenantId,
        topicId:  schedule.topicId,
        payload:  schedule.payload,
        checksum,
        source:   'scheduler',
      });

      await this.deps.events.create(event);

      const { items: consumers } = await this.deps.consumers.findByTopicId(
        schedule.topicId,
        schedule.tenantId,
        { limit: this.deps.config.schedulerConsumerLimit, offset: 0 },
      );

      await Promise.all(
        consumers.map(consumer =>
          this.deps.queue.enqueue({
            id:          crypto.randomUUID(),
            eventId:     event.id,
            tenantId:    schedule.tenantId,
            topicId:     schedule.topicId,
            consumerId:  consumer.id,
            payload:     schedule.payload,
            attempt:     0,
            scheduledAt: new Date(),
          }),
        ),
      );

      const nextRun = CronParser.parseExpression(schedule.cron).next().toDate();
      await this.deps.schedules.update(schedule.id, schedule.tenantId, {
        lastRun: firedAt,
        nextRun,
      });

      this.deps.logger.logSchedulerFired(schedule.id, schedule.topicId, schedule.cron);

    } catch (error) {
      this.deps.logger.logSchedulerError(schedule.id, error as Error);
    }
  }
}
