import { Type } from '@nestjs/common';

import { AppAbility } from '@em-plor/contracts';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface IPolicyHandler {
  handle(
    ability: AppAbility,
    context: GqlExecutionContext,
  ): boolean | Promise<boolean>;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = Type<IPolicyHandler> | PolicyHandlerCallback;
