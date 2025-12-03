import { IDepartment } from '@em-plor/contracts';
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

@Entity('departments')
export class DepartmentEntity implements IDepartment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => EmployeeEntity, (employee) => employee.department)
  employees?: EmployeeEntity[];

  @OneToMany(() => EmployeeHistoryEntity, (history) => history.department)
  histories?: EmployeeHistoryEntity[];
}
