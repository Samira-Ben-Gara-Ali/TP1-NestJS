import { Get, Query, UseGuards } from '@nestjs/common';
import { GenericCrud } from './generic-crud.service';
import { RolesGuard } from '../../guards/roles.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UserRoleEnum } from '../../users/enums/user-role.enum';
import { Roles } from '../../decorators/role.decorator';
import { DateFilterDto } from './date-filter.dto';


export class GenericController<Entity extends { id: number }> {
  constructor(protected service: GenericCrud<Entity>) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get('filter/date')
  findByDate(
    @Query() query: DateFilterDto,
  ): Promise<Entity[]> {
    return this.service.findWithDateInterval(
      query.key as keyof Entity,
      query.minDate,
      query.maxDate,
    );
  }
}