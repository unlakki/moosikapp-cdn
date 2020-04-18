import { RequestHandler, Response, NextFunction } from 'express';
import { AuthorizedRequest } from './authorization';
import XmlError from '../xml/errors';

export default (minimunRequiredRole: number): RequestHandler => (
  (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.jwt.role < minimunRequiredRole) {
      throw XmlError.Forbitten(req.path);
    }

    next();
  }
);
