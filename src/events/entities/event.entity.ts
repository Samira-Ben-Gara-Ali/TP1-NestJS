import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('event')
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entity: string;

  @Column()
  entityId: number;

  @Column()
  type: string;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}