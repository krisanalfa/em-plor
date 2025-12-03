import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AccountEntity,
  EmployeeEntity,
  DepartmentEntity,
  PositionEntity,
  EmployeeAttendanceEntity,
  EmployeeHistoryEntity,
} from './entities';
import { SeederService } from './seeder.service';

import { HashModule } from '../hash/hash.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [
        AccountEntity,
        EmployeeEntity,
        DepartmentEntity,
        PositionEntity,
        EmployeeAttendanceEntity,
        EmployeeHistoryEntity,
      ],
    }),
    TypeOrmModule.forFeature([
      AccountEntity,
      EmployeeEntity,
      DepartmentEntity,
      PositionEntity,
      EmployeeAttendanceEntity,
      EmployeeHistoryEntity,
    ]),
    HashModule,
  ],
  providers: [SeederService],
})
export class DbModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) {}

  async onModuleInit() {
    await this.seederService.seed();
  }
}
