import {
  RequestHandler, Request, Response, NextFunction,
} from 'express';
import { HttpError } from 'http-errors';
import XmlHttpError from '../xml/XmlHttpError';

export const withAsyncErrorHandler = (...handlers: RequestHandler[]) => (
  handlers.map((handler) => (
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await handler(req, res, next);
      } catch (e) {
        next(e);
      }
    }
  ))
);

export default (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (!error) {
    next();
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).send(error.message);
    return;
  }

  if (error instanceof XmlHttpError) {
    res.status(error.status).type('xml').send(error.message);
    return;
  }

  res.status(500).type('xml').send(new XmlHttpError(
    500,
    'Server encountered an unexpected condition that prevented it from fulfilling the request.',
  ));
};
