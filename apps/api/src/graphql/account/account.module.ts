import { Module } from '@nestjs/common';
import { AccountResolver } from './account.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity } from 'src/db/entities';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity])],
  providers: [AccountResolver],
})
export class AccountModule {}
