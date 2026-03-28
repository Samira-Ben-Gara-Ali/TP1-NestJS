import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserDto } from './update-user.dto';
import { UserEntity } from '../entities/user.entity';

export class UpdateByCriteriaUserDto {
  @IsObject()
  criteria: Partial<UserEntity>
  @ValidateNested()
  @Type(() => UpdateUserDto)
  dto: UpdateUserDto;
}