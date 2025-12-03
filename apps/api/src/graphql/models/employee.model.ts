import {
  IAccount,
  IDepartment,
  IEmployee,
  IEmployeeAttendance,
  IEmployeeHistory,
  IPosition,
} from '@em-plor/contracts';
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { DepartmentModel } from './department.model';
import { PositionModel } from './position.model';
import { AccountModel } from './account.model';
import { EmployeeAttendanceModel } from './employee-attendance.model';
import { EmployeeHistoryModel } from './employee-history.model';

@ObjectType({ description: 'Employee Model' })
export class EmployeeModel implements IEmployee {
  @Field(() => ID)
  name: string;

  @Field()
  dob: Date;

  @Field(() => ID)
  departmentId: string;

  @Field(() => DepartmentModel, { nullable: true })
  department?: IDepartment | undefined;

  @Field(() => ID)
  positionId: string;

  @Field(() => PositionModel, { nullable: true })
  position?: IPosition | undefined;

  @Field(() => ID, { nullable: true })
  accountId?: string | undefined;

  @Field(() => AccountModel, { nullable: true })
  account?: IAccount | undefined;

  @Field(() => ID, { nullable: true })
  reportsToId?: string | undefined;

  @Field(() => EmployeeModel, { nullable: true })
  reportsTo?: IEmployee | undefined;

  @Field(() => [EmployeeAttendanceModel], { nullable: 'items' })
  attendances?: IEmployeeAttendance[] | undefined;

  @Field(() => [EmployeeHistoryModel], { nullable: 'items' })
  histories?: IEmployeeHistory[] | undefined;

  @Field(() => ID)
  id: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType({ description: 'Paginated Employee Model' })
export class PaginatedEmployeeModel {
  @Field(() => [EmployeeModel], { nullable: 'items' })
  items: IEmployee[];

  @Field()
  total: number;

  @Field()
  totalPage: number;
}
