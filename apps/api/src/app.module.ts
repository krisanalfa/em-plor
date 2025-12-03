import { Module } from '@nestjs/common';

import { DbModule } from './db/db.module';
import { GraphQlModule } from './graphql/graphql.module';

@Module({
  imports: [DbModule, GraphQlModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
