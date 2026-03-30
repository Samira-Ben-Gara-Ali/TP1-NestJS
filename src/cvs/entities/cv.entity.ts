import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimeStampEntity } from '../../common/db/timestamp.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { SkillEntity } from '../../skills/entities/skill.entity';

@Entity('cv')
export class CvEntity extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    length: 50,
  })
  name: string;

  @Column({
    length: 50,
  })
  firstname: string;
  @Column()
  age: number;
  @Column({
    unique: true,
  })
  cin: number;
  @Column()
  job: string;
  @Column({ nullable: true })
  path: string;
  //pour chaque user va chercher les cvs correspondants
  @ManyToOne(() => UserEntity, (user) => user.cvs, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: UserEntity;
  @ManyToMany(() => SkillEntity, (skill) => skill.cvs, {
    eager: false,
    cascade: false,
  })
  @JoinTable({
    name: 'cv_skills',
    joinColumn: {
      name: 'cv_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'skill_id',
      referencedColumnName: 'id',
    },
  })
  skills: SkillEntity[];
}
