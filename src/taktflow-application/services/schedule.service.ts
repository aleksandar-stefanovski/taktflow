import type { IScheduleRepository } from '@domain/interfaces/schedule-repository.interface.js';
import type { ITopicRepository } from '@domain/interfaces/topic-repository.interface.js';
import { Schedule } from '@domain/entities/schedule.js';
import { EntityKey } from '@domain/entities/entity-key.js';
import { NotFoundException } from '@domain/exceptions/not-found-exception.js';

import type { CreateScheduleRequest } from '../requests/schedules/create-schedule.request.js';
import type { PaginationQuery } from '../requests/pagination.request.js';
import { PaginatedResult } from '../responses/paginated-result.js';

export class ScheduleService {
  constructor(
    private readonly schedules: IScheduleRepository,
    private readonly topics:    ITopicRepository,
  ) {}

  async create(request: CreateScheduleRequest & { tenantId: string }): Promise<Schedule> {
    const topic = await this.topics.findById(request.topicId);
    if (!topic) throw new NotFoundException('Topic', request.topicId);

    const schedule = new Schedule({
      key:         new EntityKey(request.tenantId),
      topicId:     request.topicId,
      cron:        request.cron,
      payload:     request.payload,
      environment: request.environment,
    });

    return this.schedules.create(schedule);
  }

  async list(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResult<Schedule>> {
    const limit  = query.pageSize;
    const offset = (query.page - 1) * query.pageSize;

    const [items, totalCount] = await Promise.all([
      this.schedules.findAll(limit, offset),
      this.schedules.count(),
    ]);

    return new PaginatedResult(items, totalCount, query.page, query.pageSize);
  }
}
