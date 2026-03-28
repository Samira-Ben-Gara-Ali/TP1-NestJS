import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillEntity } from './entities/skill.entity';
import { CvEntity } from '../cvs/entities/cv.entity';

@Module({
  controllers: [SkillsController],
  providers: [SkillsService],
  imports: [
  TypeOrmModule.forFeature([SkillEntity, CvEntity]),
],
})
export class SkillsModule {}
