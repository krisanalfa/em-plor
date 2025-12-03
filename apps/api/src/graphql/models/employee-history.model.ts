import {
  IDepartment,
  IEmployee,
  IEmployeeHistory,
  IPosition,
} from '@em-plor/contracts';
import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

import { DepartmentModel } from './department.model';
import { EmployeeModel } from './employee.model';
import { PositionModel } from './position.model';

@ObjectType({ description: 'Employee History Model' })
export class EmployeeHistoryModel implements IEmployeeHistory {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  employeeId: string;

  @Field(() => EmployeeModel, { nullable: true })
  employee?: IEmployee | undefined;

  @Field(() => ID)
  positionId: string;

  @Field(() => PositionModel, { nullable: true })
  position?: IPosition | undefined;

  @Field(() => ID)
  departmentId: string;

  @Field(() => DepartmentModel, { nullable: true })
  department?: IDepartment | undefined;

  @Field()
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate?: Date | undefined;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
