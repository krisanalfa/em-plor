import { createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

export const User = createParamDecorator((data: unknown, ctx) => {
  const gqlContext = GqlExecutionContext.create(ctx);
  const req = gqlContext.getArgByIndex<{ req: Request }>(2).req;

  return req.user;
});
