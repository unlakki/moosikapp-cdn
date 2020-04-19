import { RequestHandler, Response, NextFunction } from 'express';
import { AuthorizedRequest } from './authorization';
import { createForbittenError } from '../utils/errors';

export default (minimunRequiredRole: number): RequestHandler => (
  (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.jwt.role < minimunRequiredRole) {
      throw createForbittenError(req.path);
    }

    next();
  }
);
