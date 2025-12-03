import { IJwtPayload } from '../graphql/auth';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}
