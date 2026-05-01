import {
  Injectable,
} from '@nestjs/common';
import {  Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly repo: Repository<EventEntity>,
  ) {}

  findByEntity(entity: string) {
    return this.repo.find({
      where: { entity },
      order: { createdAt: 'DESC' },
    });
  }
  findAll(){
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }
}