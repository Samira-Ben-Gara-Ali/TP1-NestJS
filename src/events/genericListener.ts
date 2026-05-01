import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './entities/event.entity';

@Injectable()
export class EventListener {
  constructor(
    @InjectRepository(EventEntity)
    private readonly repo: Repository<EventEntity>,
  ) {}
  // listener sur crud de toutes les entites
  @OnEvent('cv.*')
  @OnEvent('user.*')
  @OnEvent('skill.*')
  handleEvent(event: {
    entity: string;
    entityId: number;
    type: string;
    userId?: number;
  }) {
    console.log('hello');
    if (!event?.entity || !event?.type) return;

    return this.repo.save({
      entity: event.entity,
      entityId: event.entityId,
      type: event.type,
      userId: event.userId,
    });
  }
}
