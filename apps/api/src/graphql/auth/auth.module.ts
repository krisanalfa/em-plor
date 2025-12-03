import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AccountEntity } from 'src/db/entities';
import { HashModule } from 'src/hash/hash.module';

import { AuthMutation } from './auth.mutation';
import { JWT_SECRET } from './constants';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity]),
    HashModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthMutation, AuthResolver],
  exports: [JwtModule],
})
export class AuthModule {}
