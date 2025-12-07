import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GqlExecutionContext } from '@nestjs/graphql';

import { AppAbility } from '@em-plor/contracts';
import { AccountEntity } from 'src/db/entities';

import { CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_POLICIES_KEY } from './policies.decorator';
import { IPolicyHandler, PolicyHandler } from './policies.types';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        gqlContext.getHandler(),
      ) || [];

    const { user } = gqlContext.getArgByIndex<{ req: Request }>(2).req;
    if (!user) return false;

    const account = await this.accountRepository.findOne({
      where: { id: user.id },
      relations: {
        employee: {
          position: true,
        },
      },
    });
    if (!account) return false;

    const ability = await this.caslAbilityFactory.create(account);

    const results = await Promise.all(
      policyHandlers.map(
        async (handler) =>
          await this.execPolicyHandler(
            handler,
            ability as AppAbility,
            gqlContext,
          ),
      ),
    );

    return results.every((result) => result === true);
  }

  private execPolicyHandler(
    handler: PolicyHandler,
    ability: AppAbility,
    context: GqlExecutionContext,
  ) {
    if (this.isPolicyHandlerClass(handler)) {
      const instance = this.moduleRef.get(handler, { strict: false });

      return instance.handle(ability, context);
    }

    return handler(ability);
  }

  private isPolicyHandlerClass(
    handler: PolicyHandler,
  ): handler is Type<IPolicyHandler> {
    return (
      typeof handler === 'function' &&
      'prototype' in handler &&
      'handle' in handler.prototype
    );
  }
}
