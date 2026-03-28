import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DeleteResult, FindOptionsWhere,
  QueryDeepPartialEntity,
  Repository,
  UpdateResult,
} from 'typeorm';

@Injectable()
export class GenericCrud<Entity extends { id: number }> {
  constructor(protected repository: Repository<Entity>) {}
  private getEntityName(): string {
    return this.repository.metadata.name.replace('Entity', '');
  }
  async findAll(): Promise<Entity[]> {
    return await this.repository.find({
      withDeleted: true,
    });
  }
  create(addDto: any): Promise<Entity> {
    return this.repository.save(addDto);
  }
  async softDelete(id: number): Promise<UpdateResult> {
    const result = await this.repository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException(`${this.getEntityName()} with id ${id} not found`);
    }
    return result;
  }
  async delete(id: number): Promise<DeleteResult> {
    const result = await this.repository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`${this.getEntityName()} with id ${id} not found`);
    }
    return result;
  }
  async restore(id: number): Promise<UpdateResult> {
    const result = await this.repository.restore(id);
    if (!result.affected) {
      throw new NotFoundException(`${this.getEntityName()} with id ${id} not found`);
    }
    return result;
  }
  async update(id: number, dto:any): Promise<Entity> {
    const entity = await this.repository.preload({
      ...dto,
      id,
    });

    if (!entity) {
      throw new NotFoundException(`${this.getEntityName()} with id ${id} not found`);
    }

    return this.repository.save(entity);
  }
  async updateByCriteria(
    criteria: FindOptionsWhere<Entity>,
    dto: QueryDeepPartialEntity<Entity>,
  ): Promise<UpdateResult> {
    const result = await this.repository.update(criteria, dto);

    if (!result.affected) {
      throw new NotFoundException(`${this.getEntityName()} not found`);
    }

    return result;
  }
  async findOne(id: number): Promise<Entity> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<Entity>,
      withDeleted: true,
    });

    if (!entity) {
      throw new NotFoundException(
        `${this.getEntityName()} with id ${id} not found`,
      );
    }

    return entity;
  }
  findWithDateInterval(
    dateField: keyof Entity,
    minDate?: Date,
    maxDate?: Date,
  ): Promise<Entity[]> {
    const alias = this.repository.metadata.name.toLowerCase(); // ex: user

    const qb = this.repository.createQueryBuilder(alias);

    if (minDate) {
      qb.andWhere(`${alias}.${String(dateField)} >= :minDate`, { minDate });
    }

    if (maxDate) {
      qb.andWhere(`${alias}.${String(dateField)} <= :maxDate`, { maxDate });
    }

    return qb.getMany();
  }

}
