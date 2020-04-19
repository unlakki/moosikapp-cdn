import {
  RequestHandler, Request, Response, NextFunction,
} from 'express';
import { HttpError, InternalServerError } from 'http-errors';
import XmlBuilder from '../utils/XmlBuilder';

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
    res.status(error.status).type('xml').send(XmlBuilder.createErrorMessage(error));
    return;
  }

  const serverError = new InternalServerError(
    'Server encountered an unexpected condition that prevented it from fulfilling the request.',
  );
  res.status(500).type('xml').send(XmlBuilder.createErrorMessage(serverError));
};
