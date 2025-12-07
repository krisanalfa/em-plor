import { IAccount, Role } from '@em-plor/contracts';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmployeeEntity } from './employee.entity';

@Entity('accounts')
export class AccountEntity implements IAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', enum: Role })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @JoinColumn({ name: 'employeeId' })
  @OneToOne(() => EmployeeEntity, (employee) => employee.accountId)
  employee?: EmployeeEntity;
}
