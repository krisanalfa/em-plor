import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { DirectiveLocation, GraphQLDirective } from 'graphql';

import { EmployeeModule } from './employee/employee.module';
import { DepartmentModule } from './department/department.module';
import { AuthModule } from './auth/auth.module';
import { PositionModule } from './positions/positions.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      autoSchemaFile: 'schema.gql',
      installSubscriptionHandlers: true,
      buildSchemaOptions: {
        dateScalarMode: 'isoDate',
        numberScalarMode: 'float',
        directives: [
          new GraphQLDirective({
            name: 'upper',
            locations: [DirectiveLocation.FIELD_DEFINITION],
          }),
        ],
      },
    }),
    EmployeeModule,
    AuthModule,
    DepartmentModule,
    PositionModule,
  ],
})
export class GraphQlModule {}
