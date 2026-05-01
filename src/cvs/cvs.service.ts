import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericCrud } from '../common/db/generic-crud.service';
import { CvEntity } from './entities/cv.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UpdateCvDto } from './dto/update-cv.dto';
import { UserRoleEnum } from '../users/enums/user-role.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventType } from '../events/entities/eventType.enum';
import { CvEventPayload } from './entities/cvEventPayload.interface';

@Injectable()
export class CvsService extends GenericCrud<CvEntity> {
  constructor(
    @InjectRepository(CvEntity)
    private readonly cvRepository: Repository<CvEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super(cvRepository);
  }

  private async validateUniqueCin(cin: number, excludeId?: number) {
    const exists = await this.cvRepository.findOne({
      where: { cin },
    });

    if (exists && exists.id !== excludeId) {
      throw new BadRequestException('CIN already exists');
    }
  }
  async findMyCvs(user: UserEntity): Promise<CvEntity[]> {
    return this.cvRepository.find({
      where: { user: { id: user.id } },
      relations: ['skills'],
    });
  }

  async findOneWithUser(id: number): Promise<CvEntity> {
    const cv = await this.cvRepository.findOne({
      where: { id },
      relations: ['user', 'skills'],
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    return cv;
  }
  private emitCvEvent(
    type: EventType,
    cvId: number,
    path: string,
    userId?: number,
  ) {
    const payload: CvEventPayload = {
      entity: 'cv',
      entityId: cvId,
      type,
      userId,
      path: path,
    };
    this.eventEmitter.emit(`cv.${type.toLowerCase()}`, payload);
  }
  async createCv(dto: Partial<CvEntity>, user: UserEntity): Promise<CvEntity> {
    await this.validateUniqueCin(dto.cin!);

    const cv = await super.create({
      ...dto,
      user,
    });
    this.emitCvEvent(EventType.CREATED, cv.id, cv.path, user.id);

    return cv;
  }

  async updateCv(
    id: number,
    dto: UpdateCvDto,
    user: UserEntity,
  ): Promise<CvEntity> {
    if (dto.cin) {
      await this.validateUniqueCin(dto.cin, id);
    }

    const updated = await super.update(id, dto);

    this.emitCvEvent(EventType.UPDATED, id, updated.path, user.id);

    return updated;
  }
  /*async deleteCv(id: number, user: UserEntity) {
    const result = await this.softDelete(id);

    this.emitCvEvent(EventType.DELETED, id, user.id, result.path);

    return result;
  }*/

  async updateCvStatus(
    id: number,
    data: {
      status: 'PENDING' | 'VALID' | 'REJECTED';
      aiReason: string;
      aiScore: number;
    },
  ): Promise<void> {
    await this.cvRepository.update(id, data);

  }
  async statCvNumberByAge(min?: number, max?: number) {
    const qb = this.cvRepository.createQueryBuilder('cv');

    qb.select('cv.age', 'age').addSelect('COUNT(cv.id)', 'count');

    if (min !== undefined) {
      qb.andWhere('cv.age >= :min', { min });
    }

    if (max !== undefined) {
      qb.andWhere('cv.age <= :max', { max });
    }

    qb.groupBy('cv.age');

    return qb.getRawMany();
  }

  async updateByCriteriaCv(
    criteria: FindOptionsWhere<CvEntity>,
    dto: UpdateCvDto,
    user: UserEntity,
  ): Promise<CvEntity[]> {
    let where: FindOptionsWhere<CvEntity>;

    if (user.role === UserRoleEnum.ADMIN) {
      where = criteria;
    } else {
      where = {
        ...criteria,
        user: {
          id: user.id,
        },
      };
    }

    const cvs = await this.cvRepository.find({
      where,
      relations: ['user'],
    });

    if (!cvs.length) {
      throw new NotFoundException('No CV found or not allowed');
    }

    const updated: CvEntity[] = [];

    for (const cv of cvs) {
      if (dto.cin) {
        await this.validateUniqueCin(dto.cin, cv.id);
      }

      const entity = this.cvRepository.merge(cv, dto);
      updated.push(await this.cvRepository.save(entity));
    }

    return updated;
  }
}