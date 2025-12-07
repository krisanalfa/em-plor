import { ResolveField, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmployeeEntity } from 'src/db/entities';
import { AccountModel, EmployeeModel } from '../models';

@Resolver(AccountModel)
export class AccountResolver {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
  ) {}

  @ResolveField(() => EmployeeModel, { name: 'employee' })
  async getEmployee(account: AccountModel) {
    return await this.employeeRepository.findOneOrFail({
      where: { accountId: account.id },
    });
  }
}
