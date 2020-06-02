import { Request, Response, NextFunction } from 'express';
import { DiskManager } from 'yadisk-mgr';
import request from 'request-promise';

export default (diskManager: DiskManager) => (
  async (req: Request, res: Response, next: NextFunction) => {
    const path = decodeURI(req.path);

    try {
      const uri = await diskManager.getFileLink(path);
      request(uri).pipe(res);
    } catch (e) {
      next();
    }
  }
);
