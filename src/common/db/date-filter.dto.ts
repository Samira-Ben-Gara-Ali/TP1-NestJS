import { IsOptional, IsDate, IsNotEmpty, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class DateFilterDto {
  @IsNotEmpty()
  @IsIn(['createdAt', 'updatedAt', 'deletedAt'])
  key: 'createdAt' | 'updatedAt' | 'deletedAt';

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  minDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  maxDate?: Date;
}
