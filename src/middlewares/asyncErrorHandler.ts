import {
  RequestHandler, Request, Response, NextFunction,
} from 'express';
import { HttpError } from 'http-errors';

const wrapper = (handler: RequestHandler) => (
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  }
);

export const withAsyncErrorHandler = (...handlers: RequestHandler[]) => (
  handlers.map((handler) => wrapper(handler))
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

  res.status(500).send('Internal Server Error');
};
