import { RequestHandler, Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';

const handleAsyncError = (handler: RequestHandler) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await handler(req, res, next);
  } catch (e) {
    next(e);
  }
};

export const withAsyncErrorHandler = (...handlers: RequestHandler[]) =>
  handlers.map(handleAsyncError);

export default (error: any, req: Request, res: Response, next: NextFunction) => {
  if (!error) {
    next();
    return;
  }

  console.log(error);

  if (error instanceof HttpError) {
    res.status(error.status).send(error.message);
    return;
  }

  res.status(500).send('Internal Server Error');
};
