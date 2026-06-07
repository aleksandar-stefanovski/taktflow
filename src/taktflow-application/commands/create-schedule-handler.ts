import type { IScheduleRepository } from '@domain/interfaces/schedule-repository.interface.js';
import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import { Schedule } from '@domain/entities/schedule.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

import type { CreateScheduleRequest } from '../requests/schedules/create-schedule.request.js';

export class CreateScheduleHandler {
  constructor(
    private readonly schedules: IScheduleRepository,
    private readonly topics: ITopicRepository,
  ) {}

  async handle(request: CreateScheduleRequest & { tenantId: string }): Promise<Schedule> {
    const topic = await this.topics.findById(request.topicId, request.tenantId);
    if (!topic) throw new NotFoundException('Topic', request.topicId);

    const schedule = new Schedule({
      tenantId:    request.tenantId,
      topicId:     request.topicId,
      cron:        request.cron,
      payload:     request.payload,
      environment: request.environment,
    });

    return this.schedules.create(schedule);
  }
}
