import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './event.service';
import { RolesGuard } from '../guards/roles.guard';
import { UserRoleEnum } from '../users/enums/user-role.enum';
import { Roles } from '../decorators/role.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  // ici on peut filtrer par entite par exmple pour cv : GET /events?entity=cv
  @Get()
  find(@Query('entity') entity?: string) {
    if (entity) {
      return this.eventsService.findByEntity(entity);
    }

    return this.eventsService.findAll();
  }
}