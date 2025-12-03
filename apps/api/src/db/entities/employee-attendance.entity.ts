import { IEmployeeAttendance } from '@em-plor/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmployeeEntity } from './employee.entity';

@Entity('employee_attendances')
export class EmployeeAttendanceEntity implements IEmployeeAttendance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  employeeId!: string;

  @Column({ type: 'datetime' })
  date!: Date;

  @Column({ type: 'datetime' })
  checkInTime!: Date;

  @Column({ type: 'datetime', nullable: true })
  checkOutTime?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => EmployeeEntity, (employee) => employee.attendances)
  employee?: EmployeeEntity;
}
