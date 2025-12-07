import { BadRequestException, Injectable } from '@nestjs/common';
import { Args, Field, InputType, Mutation, ObjectType } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { AccountEntity } from 'src/db/entities';
import { HashService } from 'src/hash/hash.service';
import { IJwtPayload } from './auth.types';
import { AccountModel } from '../models';

@InputType()
class AuthInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

@ObjectType()
class AuthModel {
  @Field(() => String)
  token: string;

  @Field(() => AccountModel)
  account: AccountModel;
}

@Injectable()
export class AuthMutation {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  @Mutation(() => AuthModel, { name: 'login' })
  async login(@Args('credentials') credentials: AuthInput): Promise<AuthModel> {
    const account = await this.accountRepository.findOneOrFail({
      where: { email: credentials.email },
    });
    const isPasswordValid = await this.hashService.compare(
      credentials.password,
      account.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload: IJwtPayload = { id: account.id };
    const token = this.jwtService.sign(payload);

    return { token, account };
  }
}
