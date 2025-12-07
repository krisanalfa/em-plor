import { Injectable, UseGuards } from '@nestjs/common';
import { Args, Context, Field, ID, InputType, Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEmployeeInput, Role } from '@em-plor/contracts';
import { Request } from 'express';

import {
  AccountEntity,
  EmployeeEntity,
  EmployeeHistoryEntity,
  PositionEntity,
} from 'src/db/entities';
import { EmployeeModel } from '../models';
import { HashService } from 'src/hash/hash.service';
import { AuthGuard, CheckPolicies, PoliciesGuard } from '../auth';
import { EmployeePolicyHandler } from './employee.policy-handler';

@InputType({ description: 'Input data for creating/updating an employee' })
export class EmployeeInput implements IEmployeeInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field()
  dob: Date;

  @Field(() => ID, { nullable: true })
  accountId?: string;

  @Field(() => ID, { nullable: true })
  departmentId?: string;

  @Field(() => ID, { nullable: true })
  positionId?: string;
}

@Injectable()
export class EmployeeMutation {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepo: Repository<EmployeeEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepo: Repository<AccountEntity>,
    @InjectRepository(EmployeeHistoryEntity)
    private readonly employeeHistoryRepo: Repository<EmployeeHistoryEntity>,
    @InjectRepository(PositionEntity)
    private readonly positionRepo: Repository<PositionEntity>,
    private readonly hashService: HashService,
  ) {}

  @UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies(EmployeePolicyHandler)
  @Mutation(() => EmployeeModel, { name: 'createEmployee' })
  async createEmployee(
    @Args('employee') input: EmployeeInput,
    @Context() { req }: { req: Request },
  ): Promise<EmployeeModel> {
    // TODO: Move authorization logic to a guard
    if (req.user!.role !== Role.ADMIN) {
      throw new Error('Unauthorized');
    }

    const { email, ...rest } = input;
    const position = rest.positionId
      ? await this.positionRepo.findOne({ where: { id: rest.positionId } })
      : undefined;
    const newEmployee = this.employeeRepo.create({
      ...rest,
      account: this.accountRepo.create({
        email,
        password: await this.hashService.encrypt('password'),
        role: position?.defaultRole ?? Role.EMPLOYEE,
      }),
    });

    return this.employeeRepo.save(newEmployee);
  }

  @UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies(EmployeePolicyHandler)
  @Mutation(() => EmployeeModel, { name: 'updateEmployee' })
  async updateEmployee(
    @Args('id', { type: () => ID }) id: string,
    @Args('employee') input: EmployeeInput,
  ): Promise<EmployeeModel> {
    const { email, ...rest } = input;
    let employee = await this.employeeRepo.findOneOrFail({
      where: { id },
      relations: { account: true },
    });
    // Detect if position and/or department changed
    const isDepartmentChanged =
      rest.departmentId && rest.departmentId !== employee.departmentId;
    const isPositionChanged =
      rest.positionId && rest.positionId !== employee.positionId;

    if (isDepartmentChanged || isPositionChanged) {
      // Get the last history entry to set its endDate
      const lastHistory = await this.employeeHistoryRepo.findOne({
        where: { employeeId: employee.id },
        order: { startDate: 'DESC' },
      });
      if (lastHistory && !lastHistory.endDate) {
        lastHistory.endDate = new Date();
        await this.employeeHistoryRepo.save(lastHistory);
      }

      // Add to history
      await this.employeeHistoryRepo.insert({
        employeeId: employee.id,
        departmentId: rest.departmentId ?? employee.departmentId,
        positionId: rest.positionId ?? employee.positionId,
        startDate: new Date(),
      });
    }

    employee = this.employeeRepo.merge(employee, rest);
    if (email && employee.account!.email !== email) {
      employee.account!.email = email;
    }

    return this.employeeRepo.save(employee);
  }
}
