import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DepartmentEntity } from 'src/db/entities';
import { AuthModule } from '../auth';

import { DepartmentResolver } from './department.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentEntity]), AuthModule],
  providers: [DepartmentResolver],
})
export class DepartmentModule {}
