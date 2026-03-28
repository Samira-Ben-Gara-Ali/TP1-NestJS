import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateCvDto } from './update-cv.dto';
import { CvEntity } from '../entities/cv.entity';

export class UpdateByCriteriaCvDto {
  @IsObject()
  criteria: Partial<CvEntity>;

  @ValidateNested()
  @Type(() => UpdateCvDto)
  dto: UpdateCvDto;
}