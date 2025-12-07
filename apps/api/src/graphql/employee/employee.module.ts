import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HashModule } from 'src/hash/hash.module';
import {
  AccountEntity,
  DepartmentEntity,
  EmployeeAttendanceEntity,
  EmployeeEntity,
  EmployeeHistoryEntity,
  PositionEntity,
} from 'src/db/entities';
import { AuthModule } from '../auth/auth.module';

import { EmployeeResolver } from './employee.resolver';
import { EmployeeMutation } from './employee.mutation';
import { EmployeePolicyHandler } from './employee.policy-handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeEntity,
      DepartmentEntity,
      PositionEntity,
      AccountEntity,
      EmployeeHistoryEntity,
      EmployeeAttendanceEntity,
    ]),
    AuthModule,
    HashModule,
  ],
  providers: [EmployeeResolver, EmployeeMutation, EmployeePolicyHandler],
})
export class EmployeeModule {}
