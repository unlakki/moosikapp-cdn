import { Request, Response } from 'express';
import DiskManager from 'yadisk-mgr';
import { createNotFoundError } from '../utils/errors';

export default (diskManager: DiskManager) => async (req: Request, res: Response) => {
  const path = decodeURI(req.path);

  try {
    const dirList = await diskManager.getDirList(path);
    res.status(200).type('xml').send(list(dirList));
  } catch (e) {
    throw createNotFoundError(req.path);
  }
};
