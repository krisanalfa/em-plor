import { Resolver } from '@nestjs/graphql';
import { AccountModel } from '../models';

@Resolver(AccountModel)
export class AccountResolver {}
