import { IEmployee } from '@em-plor/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AccountEntity } from './account.entity';
import { DepartmentEntity } from './department.entity';
import { EmployeeAttendanceEntity } from './employee-attendance.entity';
import { EmployeeHistoryEntity } from './employee-history.entity';
import { PositionEntity } from './position.entity';

@Entity('employees')
export class EmployeeEntity implements IEmployee {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  dob!: Date;

  @Column()
  positionId!: string;

  @Column()
  departmentId!: string;

  @Column({ nullable: true })
  accountId?: string;

  @Column({ nullable: true })
  reportsToId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @JoinColumn({ name: 'reportsToId' })
  @ManyToOne(() => EmployeeEntity, (employee) => employee.id)
  reportsTo?: EmployeeEntity;

  // Invert reporting relationship
  @OneToMany(() => EmployeeEntity, (employee) => employee.reportsTo)
  subordinates?: EmployeeEntity[];

  @JoinColumn({ name: 'accountId' })
  @OneToOne(() => AccountEntity, (account) => account.employee, {
    cascade: true,
  })
  account?: AccountEntity;

  @JoinColumn({ name: 'departmentId' })
  @ManyToOne(() => DepartmentEntity, (department) => department.employees)
  department?: DepartmentEntity;

  @JoinColumn({ name: 'positionId' })
  @ManyToOne(() => PositionEntity, (position) => position.employees)
  position?: PositionEntity;

  @OneToMany(
    () => EmployeeAttendanceEntity,
    (attendance) => attendance.employee,
  )
  attendances?: EmployeeAttendanceEntity[];

  @OneToMany(() => EmployeeHistoryEntity, (history) => history.employee)
  histories?: EmployeeHistoryEntity[];
}
