import { Context, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountEntity } from 'src/db/entities';
import { AccountModel } from '../models';

import { AuthGuard } from './auth.guard';

@Resolver(AccountModel)
export class AuthResolver {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
  ) {}

  @UseGuards(AuthGuard)
  @Query(() => AccountModel, { name: 'whoami' })
  async whoami(@Context() { req }: { req: Request }): Promise<AccountEntity> {
    const { id } = req.user!;
    return await this.accountRepository.findOneOrFail({ where: { id } });
  }
}
