import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GenericCrud } from '../common/db/generic-crud.service';
import { SkillEntity } from './entities/skill.entity';
import { CvEntity } from '../cvs/entities/cv.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UserRoleEnum } from '../users/enums/user-role.enum';

@Injectable()
export class SkillsService extends GenericCrud<SkillEntity> {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,

    @InjectRepository(CvEntity)
    private readonly cvRepository: Repository<CvEntity>,
  ) {
    super(skillRepository);
  }

  async attachToCv(
    skillId: number,
    cvId: number,
    user: UserEntity,
  ) {
    const cv = await this.cvRepository.findOne({
      where: { id: cvId },
      relations: ['skills', 'user'],
    });

    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    if (
      user.role !== UserRoleEnum.ADMIN &&
      cv.user.id !== user.id
    ) {
      throw new ForbiddenException('Not allowed');
    }

    const skill = await this.repository.findOne({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (!cv.skills?.some((s) => s.id === skill.id)) {
      cv.skills.push(skill);
    }

    return this.cvRepository.save(cv);
  }

}