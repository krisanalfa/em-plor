import { IDepartment, IEmployee } from '@em-plor/contracts';
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { EmployeeModel } from './employee.model';

@ObjectType({ description: 'Department Model' })
export class DepartmentModel implements IDepartment {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => [EmployeeModel], { nullable: 'items' })
  employees?: IEmployee[] | undefined;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
