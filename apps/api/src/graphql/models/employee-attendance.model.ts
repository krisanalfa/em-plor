import { IEmployee, IEmployeeAttendance } from '@em-plor/contracts';
import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

import { EmployeeModel } from './employee.model';

@ObjectType({ description: 'Employee Attendance Model' })
export class EmployeeAttendanceModel implements IEmployeeAttendance {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  employeeId: string;

  @Field(() => EmployeeModel, { nullable: true })
  employee?: IEmployee | undefined;

  @Field({ nullable: true })
  date: Date;

  @Field()
  checkInTime: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  checkOutTime?: Date | undefined;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
