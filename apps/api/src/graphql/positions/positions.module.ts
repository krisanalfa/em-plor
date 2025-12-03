import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PositionEntity } from 'src/db/entities';
import { AuthModule } from '../auth';

import { PositionResolver } from './position.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([PositionEntity]), AuthModule],
  providers: [PositionResolver],
})
export class PositionModule {}
