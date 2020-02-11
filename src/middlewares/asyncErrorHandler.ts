import {
  Request, Response, NextFunction, RequestHandler,
} from 'express';
import { JsonWebTokenError } from 'jsonwebtoken';
import HTTPError from '../errors/HTTPError';

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

  if (error instanceof JsonWebTokenError) {
    res.status(410).send('Gone.');
    return;
  }

  if (error instanceof HTTPError) {
    res.status(error.statusCode).send(error.message);
    return;
  }

  res.status(500).send('Internal server error.');
};
