import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AccountEntity, PositionEntity } from 'src/db/entities';
import { HashModule } from 'src/hash/hash.module';

import { AuthMutation } from './auth.mutation';
import { JWT_SECRET } from './constants';
import { AuthResolver } from './auth.resolver';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountEntity, PositionEntity]),
    HashModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthMutation, AuthResolver, CaslAbilityFactory],
  exports: [
    JwtModule,
    CaslAbilityFactory,
    TypeOrmModule.forFeature([AccountEntity, PositionEntity]),
  ],
})
export class AuthModule {}
