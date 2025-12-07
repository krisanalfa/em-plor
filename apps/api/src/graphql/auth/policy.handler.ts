import { GqlExecutionContext } from '@nestjs/graphql';

import { AppAbility } from '@em-plor/contracts';

import { IPolicyHandler } from './policies.types';

export interface INode<T> {
  variableValues: T;
  key: string;
  isMutation: boolean;
  isQuery: boolean;
}

export abstract class PolicyHandler implements IPolicyHandler {
  abstract handle(
    ability: AppAbility,
    context: GqlExecutionContext,
  ): boolean | Promise<boolean>;

  protected getNode<T>(context: GqlExecutionContext): INode<T> {
    const gql = context.getArgByIndex<{
      variableValues: T;
      path: {
        key: string;
        typename: string;
      };
    }>(3);

    return {
      variableValues: gql.variableValues,
      key: gql.path.key,
      isMutation: gql.path.typename === 'Mutation',
      isQuery: gql.path.typename === 'Query',
    };
  }
}
