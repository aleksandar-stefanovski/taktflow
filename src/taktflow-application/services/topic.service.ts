import type { ITopicRepository } from '@taktflow/domain/interfaces/topic-repository.interface.js';
import { Topic } from '@taktflow/domain/entities/topic.js';
import { EntityKey } from '@taktflow/domain/entities/entity-key.js';
import type { TopicConfig } from '@taktflow/domain/value-objects/topic-config.js';
import { NotFoundException } from '@taktflow/domain/exceptions/not-found-exception.js';
import { ConflictException } from '@taktflow/domain/exceptions/conflict-exception.js';

import type { ITopicService }      from '../interfaces/topic-service.interface.js';
import type { CreateTopicRequest } from '../requests/topics/create-topic.request.js';
import type { UpdateTopicRequest } from '../requests/topics/update-topic.request.js';
import type { PaginationQuery } from '../requests/pagination.request.js';
import { PaginatedResponse } from '../responses/paginated-response.js';

export class TopicService implements ITopicService {
  constructor(
    private readonly topics: ITopicRepository,
    private readonly defaultTopicConfig: TopicConfig,
  ) {}

  async create(request: CreateTopicRequest & { tenantId: string }): Promise<Topic> {
    const existing = await this.topics.findByName(request.name);
    if (existing) throw new ConflictException(`Topic '${request.name}' already exists`);

    const topic = new Topic({
      key:      EntityKey.create(request.tenantId),
      name:     request.name,
      config:   { ...this.defaultTopicConfig, ...request.config },
    });

    return this.topics.create(topic);
  }

  async getById(id: string, tenantId: string): Promise<Topic> {
    const topic = await this.topics.findById(id);
    if (!topic) throw new NotFoundException('Topic', id);
    return topic;
  }

  async update(id: string, request: UpdateTopicRequest & { tenantId: string }): Promise<Topic> {
    const topic = await this.topics.findById(id);
    if (!topic) throw new NotFoundException('Topic', id);

    if (request.name !== undefined && request.name !== topic.name) {
      const conflict = await this.topics.findByName(request.name);
      if (conflict) throw new ConflictException(`Topic '${request.name}' already exists`);
    }

    const mergedConfig = request.config !== undefined
      ? { ...topic.config, ...request.config }
      : undefined;

    return this.topics.update(id, {
      ...(request.name !== undefined && { name: request.name }),
      ...(mergedConfig !== undefined && { config: mergedConfig }),
    });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const topic = await this.topics.findById(id);
    if (!topic) throw new NotFoundException('Topic', id);
    await this.topics.delete(id);
  }

  async list(query: PaginationQuery & { tenantId: string }): Promise<PaginatedResponse<Topic>> {
    const limit  = query.pageSize;
    const offset = (query.page - 1) * query.pageSize;

    const [items, totalCount] = await Promise.all([
      this.topics.findAll(limit, offset),
      this.topics.count(),
    ]);

    return new PaginatedResponse(items, totalCount, query.page, query.pageSize);
  }
}
