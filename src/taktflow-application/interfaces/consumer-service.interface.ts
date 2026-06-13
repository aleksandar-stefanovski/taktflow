import type { Consumer }       from '@taktflow/domain/entities/consumer.js';
import type { EventDelivery }  from '@taktflow/domain/entities/event-delivery.js';
import type { ClaimedEvent }   from '@taktflow/domain/types/claimed-event.type.js';

import type { CreatePushConsumerRequest } from '../requests/consumers/create-push-consumer.request.js';
import type { CreatePullConsumerRequest } from '../requests/consumers/create-pull-consumer.request.js';
import type { ListConsumersQuery }        from '../requests/consumers/list-consumers.request.js';
import type { UpdateConsumerRequest }     from '../requests/consumers/update-consumer.request.js';
import type { AcknowledgeEventRequest }   from '../requests/events/acknowledge-event.request.js';
import type { PaginatedResponse }           from '../responses/paginated-response.js';

export interface IConsumerService {
  createPush(request: CreatePushConsumerRequest & { tenantId: string }): Promise<Consumer>;
  createPull(request: CreatePullConsumerRequest & { tenantId: string }): Promise<Consumer>;
  getById(id: string, tenantId: string): Promise<Consumer>;
  getHealth(consumerId: string, tenantId: string): Promise<EventDelivery[]>;
  list(query: ListConsumersQuery & { tenantId: string }): Promise<PaginatedResponse<Consumer>>;
  update(id: string, request: UpdateConsumerRequest & { tenantId: string }): Promise<Consumer>;
  delete(id: string, tenantId: string): Promise<void>;
  pause(id: string, tenantId: string): Promise<Consumer>;
  resume(id: string, tenantId: string): Promise<Consumer>;
  consume(consumerId: string, tenantId: string, limit: number): Promise<ClaimedEvent[]>;
  acknowledge(eventId: string, request: AcknowledgeEventRequest & { tenantId: string }): Promise<void>;
}
