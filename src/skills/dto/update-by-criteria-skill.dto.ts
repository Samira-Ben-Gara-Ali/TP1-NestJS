import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateSkillDto } from './update-skill.dto';
import { SkillEntity } from '../entities/skill.entity';

export class UpdateByCriteriaSkillDto {
  @IsObject()
  criteria: Partial<SkillEntity>

  @ValidateNested()
  @Type(() => UpdateSkillDto)
  dto: UpdateSkillDto;
}