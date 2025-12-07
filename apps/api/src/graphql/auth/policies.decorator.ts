import { SetMetadata } from '@nestjs/common';

import { PolicyHandler } from './policies.types';

export const CHECK_POLICIES_KEY = '@em-plor/api:check_policy';
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
