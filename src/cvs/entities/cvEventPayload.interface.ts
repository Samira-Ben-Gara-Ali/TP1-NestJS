import { EventType } from '../../events/entities/eventType.enum';

export interface CvEventPayload {
  entity: 'cv';
  entityId: number;
  type: EventType;
  userId?: number;
  path: string;
}