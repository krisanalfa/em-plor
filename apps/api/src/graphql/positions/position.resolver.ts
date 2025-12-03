import { Query, Resolver } from '@nestjs/graphql';
import { Repository } from 'typeorm';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PositionEntity } from 'src/db/entities';
import { PositionModel } from '../models';
import { AuthGuard } from '../auth';

@Resolver(PositionModel)
export class PositionResolver {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => [PositionModel], { name: 'positions' })
  async getPositions(): Promise<PositionModel[]> {
    return await this.positionRepository.find();
  }
}
