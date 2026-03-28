import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Version,
  UseGuards,
  Delete,
  Get,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { SkillEntity } from './entities/skill.entity';
import { GenericController } from '../common/db/generic-crud.controller';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { UpdateResult, FindOptionsWhere } from 'typeorm';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/role.decorator';
import { UserRoleEnum } from '../users/enums/user-role.enum';
import { UpdateByCriteriaSkillDto } from './dto/update-by-criteria-skill.dto';

@Controller('skills')
export class SkillsController extends GenericController<SkillEntity> {
  constructor(private readonly skillsService: SkillsService) {
    super(skillsService);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.skillsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Post()
  create(@Body() dto: CreateSkillDto): Promise<SkillEntity> {
    return this.skillsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Version('1')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSkillDto,
  ): Promise<SkillEntity> {
    return this.skillsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Version('2')
  @Patch()
  updateByCriteria(
    @Body() body: UpdateByCriteriaSkillDto,
  ): Promise<UpdateResult> {
    return this.skillsService.updateByCriteria(
      body.criteria,
      body.dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':skillId/cv/:cvId')
  attachToCv(
    @Param('skillId', ParseIntPipe) skillId: number,
    @Param('cvId', ParseIntPipe) cvId: number,
    @CurrentUser() user: UserEntity,
  ) {
    return this.skillsService.attachToCv(skillId, cvId, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.softDelete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.restore(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.skillsService.delete(id);
  }
}