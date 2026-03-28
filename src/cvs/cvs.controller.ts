import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvEntity } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericController } from '../common/db/generic-crud.controller';
import { StatParamDto } from './dto/stat-param-cv.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserEntity } from '../users/entities/user.entity';
import { CurrentUser } from '../decorators/current-user.decorator';
import { FindOptionsWhere } from 'typeorm';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/role.decorator';
import { UserRoleEnum } from '../users/enums/user-role.enum';
import { UpdateByCriteriaCvDto } from './dto/update-by-criteria-cv.dto';

@Controller('cvs')
export class CvsController extends GenericController<CvEntity> {
  constructor(private readonly cvsService: CvsService) {
    super(cvsService);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: UserEntity) {
    if (user.role === UserRoleEnum.ADMIN) {
      return this.cvsService.findAll();
    }
    return this.cvsService.findMyCvs(user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Get('stats')
  statsCvNumberByAge(@Query() query: StatParamDto) {
    return this.cvsService.statCvNumberByAge(
      query.min,
      query.max,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    const cv = await this.cvsService.findOneWithUser(id);

    if (user.role === UserRoleEnum.ADMIN || cv.user.id === user.id) {
      return cv;
    }
    throw new ForbiddenException('You can only access your own cvs');
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateCvDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.cvsService.createCv(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCvDto,
    @CurrentUser() user: UserEntity,
  ): Promise<CvEntity> {
    const cv = await this.cvsService.findOneWithUser(id);
    if (user.role === UserRoleEnum.ADMIN || cv.user.id === user.id) {
      return this.cvsService.updateCv(id, dto);
    }
    throw new ForbiddenException('You can only modify your own cvs');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    const cv = await this.cvsService.findOneWithUser(id);
    if (user.role === UserRoleEnum.ADMIN || cv.user.id === user.id) {
      return this.cvsService.softDelete(id);
    }
    throw new ForbiddenException('You can only delete your own cvs');
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateByCriteria(
    @Body() body: UpdateByCriteriaCvDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.cvsService.updateByCriteriaCv(
      body.criteria,
      body.dto,
      user,
    );
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.cvsService.restore(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @Delete(':id/hard')
  hardDelete(@Param('id', ParseIntPipe) id: number) {
    return this.cvsService.delete(id);
  }
}