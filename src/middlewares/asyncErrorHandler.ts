import {
  Request, Response, NextFunction, RequestHandler,
} from 'express';

interface MaybeHttpError extends Error {
  statusCode?: number;
}

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

export default (error: MaybeHttpError, req: Request, res: Response, next: NextFunction) => {
  if (!error) {
    next();
    return;
  }

  if (error.statusCode && error.message) {
    res.status(error.statusCode).send({ message: error.message });
    return;
  }

  res.status(500).send('Internal server error.');
};
