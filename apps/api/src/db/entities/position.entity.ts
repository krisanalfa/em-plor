import { IPosition } from '@em-plor/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmployeeEntity } from './employee.entity';
import { EmployeeHistoryEntity } from './employee-history.entity';

@Entity('positions')
export class PositionEntity implements IPosition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => EmployeeEntity, (employee) => employee.position)
  employees?: EmployeeEntity[];

  @OneToMany(() => EmployeeHistoryEntity, (history) => history.position)
  histories?: EmployeeHistoryEntity[];
}
