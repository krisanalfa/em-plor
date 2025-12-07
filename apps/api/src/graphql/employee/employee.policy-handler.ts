import { Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';

import { Action, AppAbility, IEmployeeInput } from '@em-plor/contracts';
import { EmployeeEntity } from 'src/db/entities';
import { INode, PolicyHandler } from '../auth';
import { EmployeeInput } from './employee.mutation';

type WithId<T> = T & { id: string };

@Injectable()
export class EmployeePolicyHandler extends PolicyHandler {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
  ) {
    super();
  }

  handle(
    ability: AppAbility,
    context: GqlExecutionContext,
  ): boolean | Promise<boolean> {
    const node = this.getNode(context);
    if (node.isMutation && node.key === 'updateEmployee') {
      return this.handleEmployeeUpdate(
        ability,
        node as INode<WithId<IEmployeeInput>>,
      );
    }

    return false;
  }

  private async handleEmployeeUpdate(
    ability: AppAbility,
    node: INode<WithId<IEmployeeInput>>,
  ): Promise<boolean> {
    const { id } = node.variableValues;
    if (!id) return false;

    const employee = await this.employeeRepository.findOneByOrFail({ id });

    return (
      ability.can(Action.Update, employee) &&
      ability.can(
        Action.Update,
        plainToInstance(EmployeeInput, node.variableValues),
      )
    );
  }
}
