import { RequestHandler, Response, NextFunction } from 'express';
import HttpErrors from 'http-errors';
import { AuthorizedRequest } from './authorization';

export default (minimunRequiredRole: number): RequestHandler => (
  (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.jwt.role < minimunRequiredRole) {
      throw new HttpErrors.Forbidden('Access denied.');
    }

    next();
  }
);
