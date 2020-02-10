import { Request, Response, NextFunction } from 'express';

export default (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (!error) {
    next();
  }

  res.status(500).send('Internal server error.');
};
