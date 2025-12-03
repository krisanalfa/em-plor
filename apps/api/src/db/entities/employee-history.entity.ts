import { IEmployeeHistory } from '@em-plor/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DepartmentEntity } from './department.entity';
import { EmployeeEntity } from './employee.entity';
import { PositionEntity } from './position.entity';

@Entity('employee_histories')
export class EmployeeHistoryEntity implements IEmployeeHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  employeeId!: string;

  @Column()
  positionId!: string;

  @Column()
  departmentId!: string;

  @Column({ type: 'datetime' })
  startDate!: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => EmployeeEntity, (employee) => employee.histories)
  employee?: EmployeeEntity;

  @ManyToOne(() => PositionEntity, (position) => position.histories)
  position?: PositionEntity;

  @ManyToOne(() => DepartmentEntity, (department) => department.histories)
  department?: DepartmentEntity;
}
