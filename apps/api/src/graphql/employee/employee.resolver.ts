import {
  Args,
  ArgsType,
  Field,
  ID,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { FindManyOptions, FindOptionsWhere, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UseGuards } from '@nestjs/common';

import { Role, SortableEmployeeField } from '@em-plor/contracts';
import {
  AccountEntity,
  DepartmentEntity,
  EmployeeAttendanceEntity,
  EmployeeEntity,
  EmployeeHistoryEntity,
  PositionEntity,
} from 'src/db/entities';
import { AuthGuard } from '../auth/auth.guard';
import {
  EmployeeModel,
  DepartmentModel,
  PositionModel,
  AccountModel,
  PaginatedEmployeeModel,
  EmployeeAttendanceModel,
  EmployeeHistoryModel,
} from '../models';
import { User } from '../auth';

registerEnumType(SortableEmployeeField, {
  name: 'SortableEmployeeField',
  description: 'Fields by which employees can be sorted',
});

@ArgsType()
class GetEmployeesArgs {
  @Field(() => Number, { nullable: true, defaultValue: 0 })
  skip?: number;

  @Field(() => Number, { nullable: true, defaultValue: 10 })
  take?: number;

  @Field(() => String, { nullable: true })
  filter?: string;

  @Field(() => SortableEmployeeField, { nullable: true })
  sortby?: SortableEmployeeField;
}

@Resolver(EmployeeModel)
export class EmployeeResolver {
  constructor(
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(EmployeeAttendanceEntity)
    private readonly employeeAttendanceRepository: Repository<EmployeeAttendanceEntity>,
    @InjectRepository(EmployeeHistoryEntity)
    private readonly employeeHistoryRepository: Repository<EmployeeHistoryEntity>,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => EmployeeModel, { name: 'employee' })
  async getEmployee(@Args('id', { type: () => ID }) id: string) {
    return await this.employeeRepository.findOneOrFail({ where: { id } });
  }

  @UseGuards(AuthGuard)
  @Query(() => PaginatedEmployeeModel, { name: 'employees' })
  async getEmployees(
    @Args() args: GetEmployeesArgs,
    @User() user: AccountEntity,
  ): Promise<PaginatedEmployeeModel> {
    const skip = args.skip ?? 0;
    const take = args.take ?? 10;

    const findOptions: FindManyOptions<EmployeeEntity> = { skip, take };
    if (args.sortby === SortableEmployeeField.NAME) {
      findOptions.order = { name: 'ASC' };
    } else if (args.sortby === SortableEmployeeField.JOIN_DATE_ASC) {
      findOptions.order = { createdAt: 'ASC' };
    } else if (args.sortby === SortableEmployeeField.JOIN_DATE_DESC) {
      findOptions.order = { createdAt: 'DESC' };
    }

    const whereConditions: FindOptionsWhere<EmployeeEntity>[] = [];
    if (args.filter) {
      whereConditions.push({
        id: user.role === Role.EMPLOYEE ? user.employee!.id : undefined,
        reportsToId: user.role === Role.MANAGER ? user.employee!.id : undefined,
        name: Like(`%${args.filter}%`),
      });
      whereConditions.push({
        id: user.role === Role.EMPLOYEE ? user.employee!.id : undefined,
        reportsToId: user.role === Role.MANAGER ? user.employee!.id : undefined,
        account: { email: Like(`%${args.filter}%`) },
      });
    } else {
      whereConditions.push({
        id: user.role === Role.EMPLOYEE ? user.employee!.id : undefined,
        reportsToId: user.role === Role.MANAGER ? user.employee!.id : undefined,
      });
    }
    findOptions.where = whereConditions;

    const [employees, totalCount] =
      await this.employeeRepository.findAndCount(findOptions);

    return {
      items: employees,
      total: totalCount,
      totalPage: Math.ceil(totalCount / take),
    };
  }

  @UseGuards(AuthGuard)
  @ResolveField(() => DepartmentModel, { name: 'department' })
  async resolveDepartment(employee: EmployeeModel) {
    return await this.departmentRepository.findOneOrFail({
      where: { id: employee.departmentId },
    });
  }

  @UseGuards(AuthGuard)
  @ResolveField(() => PositionModel, { name: 'position' })
  async resolvePosition(employee: EmployeeModel) {
    return await this.positionRepository.findOneOrFail({
      where: { id: employee.positionId },
    });
  }

  @UseGuards(AuthGuard)
  @ResolveField(() => AccountModel, { name: 'account' })
  async resolveAccount(employee: EmployeeModel) {
    return await this.accountRepository.findOneOrFail({
      where: { id: employee.accountId },
    });
  }

  @UseGuards(AuthGuard)
  @ResolveField(() => [EmployeeAttendanceModel], { name: 'attendances' })
  async resolveAttendances(employee: EmployeeModel) {
    const attendances = await this.employeeAttendanceRepository.find({
      where: { employeeId: employee.id },
      order: { date: 'DESC' },
    });

    return attendances;
  }

  @UseGuards(AuthGuard)
  @ResolveField(() => [EmployeeHistoryModel], { name: 'histories' })
  async resolveHistories(employee: EmployeeModel) {
    const histories = await this.employeeHistoryRepository.find({
      where: { employeeId: employee.id },
      order: { startDate: 'DESC' },
      relations: {
        position: true,
        department: true,
      },
    });

    return histories;
  }

  @UseGuards(AuthGuard)
  @ResolveField(() => EmployeeModel, { name: 'reportsTo' })
  async resolveReportsTo(employee: EmployeeModel) {
    const reportsTo = await this.employeeRepository.findOne({
      where: { id: employee.reportsToId },
    });

    return reportsTo;
  }
}
