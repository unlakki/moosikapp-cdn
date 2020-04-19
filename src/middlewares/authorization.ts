import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { createForbittenError } from '../utils/errors';

const { JWT_SECRET } = process.env;

interface AccessToken {
  role: number;
}

export interface AuthorizedRequest extends Request {
  jwt: AccessToken;
}

export default () => (
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer')) {
      throw createForbittenError(req.path);
    }

    const token = authorization.slice(7);

    try {
      req.jwt = <AccessToken>JWT.verify(token, String(JWT_SECRET));
    } catch (e) {
      throw createForbittenError(req.path);
    }

    next();
  }
);
