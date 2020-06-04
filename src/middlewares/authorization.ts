import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import HttpErrors from 'http-errors';
import { jwtSecretKey } from '../config';

interface UserAuth {
  uuid: string;
  role: number;
}

export interface AuthorizedRequest extends Request {
  user: UserAuth;
}

export default () => (
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer')) {
      throw new HttpErrors.Forbidden();
    }

    const accessToken = authorization.slice(7);

    try {
      req.user = <UserAuth>JWT.verify(accessToken, jwtSecretKey);
    } catch (e) {
      throw new HttpErrors.Forbitten();
    }

    next();
  }
);
