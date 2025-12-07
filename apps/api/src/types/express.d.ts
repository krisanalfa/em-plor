import { IAccount } from '@em-plor/contracts';

declare global {
  namespace Express {
    interface Request {
      user?: IAccount;
    }
  }
}
