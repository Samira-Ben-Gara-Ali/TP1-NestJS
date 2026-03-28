import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Delete,
  ForbiddenException,
} from '@nestjs/common';
import { CvsService } from './cvs.service';
import { CvEntity } from './entities/cv.entity';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { GenericController } from '../common/db/generic-crud.controller';
import { StatParamDto } from './dto/stat-param-cv.dto';
import { UpdateByCriteriaCvDto } from './dto/update-by-criteria-cv.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';

@Controller('cvs')
export class CvsController extends GenericController<CvEntity> {
  constructor(private readonly cvsService: CvsService) {
    super(cvsService);
  }

  @Get()
  findAll(@CurrentUser() user: UserEntity) {
    return this.cvsService.findMyCvs(user.id);
  }

  @Get('stats')
  statsCvNumberByAge(@Query() query: StatParamDto) {
    return this.cvsService.statCvNumberByAge(
      query.min,
      query.max,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    const cv = await this.cvsService.findOneWithUser(id);

    if (cv.user.id !== user.id) {
      throw new ForbiddenException('Not allowed');
    }

    return cv;
  }


  @Post()
  create(
    @Body() dto: CreateCvDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.cvsService.createCv(
      dto,
      { id: user.id } as UserEntity,
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCvDto,
    @CurrentUser() user: UserEntity,
  ): Promise<CvEntity> {
    const cv = await this.cvsService.findOneWithUser(id);

    if (cv.user.id !== user.id) {
      throw new ForbiddenException('Not allowed');
    }

    return this.cvsService.updateCv(id, dto);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    const cv = await this.cvsService.findOneWithUser(id);

    if (cv.user.id !== user.id) {
      throw new ForbiddenException('Not allowed');
    }

    return this.cvsService.softDelete(id);
  }


  @Patch()
  updateByCriteria(
    @Body() body: UpdateByCriteriaCvDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.cvsService.updateByCriteriaCv(
      {
        ...body.criteria,
        user: { id: user.id},
      },
      body.dto,
    );
  }

  @Patch(':id/restore')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    const cv = await this.cvsService.findOneWithUser(id);

    if (cv.user.id !== user.id) {
      throw new ForbiddenException('Not allowed');
    }

    return this.cvsService.restore(id);
  }
  @Delete(':id/hard')
  async hardDelete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity,
  ) {
    const cv = await this.cvsService.findOneWithUser(id);

    if (cv.user.id !== user.id) {
      throw new ForbiddenException('Not allowed');
    }

    return this.cvsService.delete(id);
  }
}