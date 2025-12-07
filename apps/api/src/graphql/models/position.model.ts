import { IEmployee, IPosition, Role } from '@em-plor/contracts';
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { EmployeeModel } from './employee.model';

@ObjectType({ description: 'Position Model' })
export class PositionModel implements IPosition {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  // Ignored
  rankIndex: number;

  // Ignored
  defaultRole?: Role | undefined;

  @Field(() => [EmployeeModel], { nullable: 'items' })
  employees?: IEmployee[] | undefined;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
