import { IAccount, IEmployee, Role } from '@em-plor/contracts';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import { EmployeeModel } from './employee.model';

registerEnumType(Role, {
  name: 'Role',
  description: 'User role in the system',
});

@ObjectType({ description: 'Account Model' })
export class AccountModel implements IAccount {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  // Do not expose
  password: string;

  @Field(() => Role)
  role: Role;

  @Field(() => EmployeeModel, { nullable: true })
  employee?: IEmployee | undefined;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
