import { Module } from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvsController } from './cvs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvEntity } from './entities/cv.entity';
import { EventsModule } from '../events/events.module';

@Module({
  controllers: [CvsController],
  providers: [CvsService],
  imports: [TypeOrmModule.forFeature([CvEntity]), EventsModule],
  exports: [CvsService]
})
export class CvsModule {}
