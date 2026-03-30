import { Get, Query } from '@nestjs/common';
import { GenericCrud } from './generic-crud.service';
import { DateFilterDto } from './date-filter.dto';

export class GenericController<Entity extends { id: number }> {
  constructor(protected service: GenericCrud<Entity>) {}

  @Get('filter/date')
  findByDate(@Query() query: DateFilterDto): Promise<Entity[]> {
    return this.service.findWithDateInterval(
      query.key as keyof Entity,
      query.minDate,
      query.maxDate,
    );
  }
}
