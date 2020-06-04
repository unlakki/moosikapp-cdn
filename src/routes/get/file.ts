import { Request, Response, NextFunction } from 'express';
import { DiskManager } from 'yadisk-mgr';
import request from 'request';

export default (diskManager: DiskManager) => (
  async (req: Request, res: Response, next: NextFunction) => {
    const path = decodeURI(req.path);

    try {
      request(await diskManager.getFileLink(path)).pipe(res);
    } catch {
      next();
    }
  }
);
