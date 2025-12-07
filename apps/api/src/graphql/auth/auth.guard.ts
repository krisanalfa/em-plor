import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { GqlExecutionContext } from '@nestjs/graphql';

import { JWT_SECRET } from './constants';
import { IJwtPayload } from './auth.types';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from 'src/db/entities';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getArgByIndex<{ req: Request }>(2).req;
    const token = this.extractTokenFromHeader(request);
    if (!token) return false;

    try {
      const payload = await this.jwtService.verifyAsync<IJwtPayload>(token, {
        secret: JWT_SECRET,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request.user = await this.accountRepository.findOneOrFail({
        where: { id: payload.id },
      });
    } catch {
      return false;
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
