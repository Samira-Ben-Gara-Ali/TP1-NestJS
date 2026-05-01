import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { EventsController } from './event.controller';
import { EventsService } from './event.service';
import { EventListener } from './genericListener';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventEntity])
  ],
  controllers: [EventsController],
  providers: [EventsService, EventListener],
})
export class EventsModule {}
