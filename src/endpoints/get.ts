import { Request, Response } from 'express';
import DiskManager from 'yadisk-mgr';
import HttpErrors from 'http-errors';
import filesize from 'filesize';
import request from 'request-promise';
import checkAuth from '../utils/checkAuth';

export default (diskManager: DiskManager) => async (req: Request, res: Response) => {
  const path = decodeURI(req.path);

  try {
    const uri = await diskManager.getFileLink(path);
    request(uri).pipe(res);
  } catch (e1) {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer')) {
      throw new HttpErrors.Forbidden('Access denied.');
    }
    checkAuth(authorization.slice(7));

    try {
      const dirList = await diskManager.getDirList(path);
      res.status(200).render('dirList', {
        dirList: dirList.map((item) => {
          const basePath = `${path}${path.endsWith('/') ? '' : '/'}`;

          return {
            ...item,
            size: item.size ? filesize(item.size) : 'N/A',
            link: `${basePath}${item.name}`,
          };
        }),
      });
    } catch (e2) {
      throw new HttpErrors.NotFound('Not found.');
    }
  }
};
