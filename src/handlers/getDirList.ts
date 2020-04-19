import { Request, Response } from 'express';
import DiskManager from 'yadisk-mgr';
import xml from 'xml';
import filesize from 'filesize';
import { createNotFoundError } from '../utils/errors';

export default (diskManager: DiskManager) => async (req: Request, res: Response) => {
  const path = decodeURI(req.path);

  try {
    const items = await diskManager.getDirList(path);
    res.status(200).type('xml').send(
      xml({
        ItemList: items.map((item) => ({
          Item: [
            {
              Name: decodeURI(item.name),
            },
            {
              Type: item.type,
            },
            {
              Size: item.size ? filesize(item.size) : 'N/A',
            },
          ],
        })),
      }),
    );
  } catch (e) {
    throw createNotFoundError(req.path);
  }
};
