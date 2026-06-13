import type { IScheduleRepository } from '@taktflow/domain/interfaces/schedule-repository.interface.js';
import type { ITopicRepository } from '@taktflow/domain/interfaces/topic-repository.interface.js';
import { Schedule } from '@taktflow/domain/entities/schedule.js';
import { EntityKey } from '@taktflow/domain/entities/entity-key.js';
import { NotFoundException } from '@taktflow/domain/exceptions/not-found-exception.js';

import type { IScheduleService }      from '../interfaces/schedule-service.interface.js';
import type { CreateScheduleRequest } from '../requests/schedules/create-schedule.request.js';
import type { PaginationQuery } from '../requests/pagination.request.js';
import { PaginatedResponse } from '../responses/paginated-response.js';

export class ScheduleService implements IScheduleService {
  constructor(
    private readonly schedules: IScheduleRepository,
    private readonly topics:    ITopicRepository,
  ) {}

  async create(request: CreateScheduleRequest & { tenantId: string }): Promise<Schedule> {
    const topic = await this.topics.findById(request.topicId);
    if (!topic) throw new NotFoundException('Topic', request.topicId);

    const schedule = new Schedule({
      key:         EntityKey.create(request.tenantId),
      topicId:     request.topicId,
      cron:        request.cron,
      payload:     request.payload,
      environment: request.environment,
    });

    return this.schedules.create(schedule);
  }

  async list(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResponse<Schedule>> {
    const limit  = query.pageSize;
    const offset = (query.page - 1) * query.pageSize;

    const [items, totalCount] = await Promise.all([
      this.schedules.findAll(limit, offset),
      this.schedules.count(),
    ]);

    return new PaginatedResponse(items, totalCount, query.page, query.pageSize);
  }
}
