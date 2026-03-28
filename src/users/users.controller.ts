import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  Version,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { GenericController } from '../common/db/generic-crud.controller';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindOptionsWhere, UpdateResult } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/role.decorator';
import { UserRoleEnum } from './enums/user-role.enum';
import { UpdateByCriteriaUserDto } from './dto/update-by-criteria-user.dto';

@Controller('users')
export class UsersController extends GenericController<UserEntity> {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    if (user.role === UserRoleEnum.ADMIN || user.id === id) {
      return this.usersService.findOne(id);
    }
   throw new ForbiddenException('You can only access to your account');

  }
  @UseGuards(JwtAuthGuard)
  @Version('1')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: UserEntity,
  ) {
    if (user.role === UserRoleEnum.ADMIN || user.id === id) {
      return this.usersService.updateUser(id, dto);
    }
    throw new ForbiddenException('You can only update your own account');

  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Version('2')
  @Patch()
  updateByCriteria(
    @Body() body: UpdateByCriteriaUserDto,
  ): Promise<UpdateResult> {
    return this.usersService.updateByCriteria(
      body.criteria,
      body.dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    if (user.role === UserRoleEnum.ADMIN || user.id === id) {
      return this.usersService.softDelete(id);
    }
    throw new ForbiddenException('You can only delete your own account');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.restore(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }
}