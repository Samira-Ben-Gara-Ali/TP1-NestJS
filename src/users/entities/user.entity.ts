import {
  Column,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimeStampEntity } from '../../common/db/timestamp.entity';
import { CvEntity } from '../../cvs/entities/cv.entity';
import { UserRoleEnum } from '../enums/user-role.enum';

@Entity('user')
export class UserEntity extends TimeStampEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    length: 50,
    unique: true,
  })
  username: string;
  @Column({
    length: 50,
    unique: true,
  })
  email: string;
  @Column({
    select :false
  })
  password: string;
  //pour chaque cv va chercher l'user associee
  @OneToMany(() => CvEntity, (cv) => cv.user, {
    cascade: true,
    eager: false
  })
  cvs: CvEntity[];

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.USER
  })
  role: UserRoleEnum;
}
