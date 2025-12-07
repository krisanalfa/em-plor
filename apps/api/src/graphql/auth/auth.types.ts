export interface IJwtPayload {
  readonly id: string;
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
