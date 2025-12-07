import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
} from '@casl/ability';
import { Injectable, Type } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Action, Role, Subjects, EmployeeInput } from '@em-plor/contracts';
import { PositionEntity } from 'src/db/entities';
import { AccountModel, EmployeeModel } from '../models';

@Injectable()
export class CaslAbilityFactory {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
  ) {}

  async create(account: AccountModel) {
    const positions = await this.positionRepository.find();

    const { can, build } = new AbilityBuilder(createMongoAbility);

    // Any logged-in user can read EmployeeModel
    can(Action.Read, EmployeeModel);

    if (account.role === Role.ADMIN) {
      // Admins can manage everything
      can(Action.Manage, 'all');
    }

    if (account.role === Role.MANAGER) {
      // Complex rule: Managers can update EmployeeInput, but with restrictions
      const currentPosition = account.employee!.position!;
      const allowedPositionIds = positions
        .filter((pos) => pos.rankIndex < currentPosition.rankIndex)
        .map((pos) => pos.id);
      can(Action.Update, EmployeeInput, {
        // Can't change department
        departmentId: account.employee!.departmentId,
        // Can't change position to higher or equal rank than themselves
        positionId: { $in: allowedPositionIds },
      });
    }

    if (account.role === Role.EMPLOYEE) {
      // Employees can read and update their own EmployeeModel
      can(Action.Update, EmployeeModel, { id: account.employee!.id });
      // Can't change position and department
      can(Action.Update, EmployeeInput, {
        positionId: account.employee!.positionId,
        departmentId: account.employee!.departmentId,
      });
    }

    return build({
      detectSubjectType: (item: Type<unknown>) => {
        return item.constructor as unknown as ExtractSubjectType<Subjects>;
      },
    });
  }
}
