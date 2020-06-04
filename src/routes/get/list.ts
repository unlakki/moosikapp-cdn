import { Request, Response } from 'express';
import { DiskManager } from 'yadisk-mgr';
import HttpErrors from 'http-errors';

export default (diskManager: DiskManager) => (
  async (req: Request, res: Response) => {
    const path = decodeURI(req.path);

    try {
      const items = await diskManager.getDirList(path);
      res.status(200).send(items);
    } catch (e) {
      throw new HttpErrors.NotFound();
    }
  }
);
