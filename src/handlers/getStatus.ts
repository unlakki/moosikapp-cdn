import { Request, Response } from 'express';
import DiskManager from 'yadisk-mgr';

export default (diskManager: DiskManager) => async (req: Request, res: Response) => {
  const status = await diskManager.getStatus();
  res.status(200).send(status);
};
