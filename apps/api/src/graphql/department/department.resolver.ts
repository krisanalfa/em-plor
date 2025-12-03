import { Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UseGuards } from '@nestjs/common';

import { DepartmentEntity } from 'src/db/entities';

import { DepartmentModel } from '../models';
import { AuthGuard } from '../auth';

@Resolver(DepartmentModel)
export class DepartmentResolver {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => [DepartmentModel], { name: 'departments' })
  async getDepartments(): Promise<DepartmentModel[]> {
    return await this.departmentRepository.find();
  }
}
