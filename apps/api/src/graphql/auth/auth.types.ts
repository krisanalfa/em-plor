import { Role } from '@em-plor/contracts';

export interface IJwtPayload {
  readonly id: string;
  readonly role: Role;
}

export enum Action {
  MANAGE = 'manage',
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum Resource {
  ACCOUNT = 'account',
  EMPLOYEE = 'employee',
}
