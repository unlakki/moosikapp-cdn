import Path from 'path';
import Express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import JWT from 'jsonwebtoken';
import request from 'request-promise';
import filesize from 'filesize';
import DiskManager from 'yadisk-mgr';
import HttpErrors from 'http-errors';
import UploadTargetManager, { UploadTarget } from './managers/UploadTargetManager';
import checkAuth from './utils/checkAuth';
import contentTypeToExtension from './utils/contentTypeToExtension';
import asyncErrorHandler, { withAsyncErrorHandler } from './middlewares/asyncErrorHandler';

const { PORT, TOKEN_LIST, JWT_SECRET } = process.env;

const tokenList = JSON.parse(String(TOKEN_LIST));
const diskManager = new DiskManager(tokenList);

const uploadTargetManager = new UploadTargetManager();

const app = Express();

app.use(helmet({ hsts: false }));
app.use(cors());

app.set('view engine', 'pug');
app.set('views', Path.resolve('src/views'));

app.get('/status.json', withAsyncErrorHandler(
  async (req: Request, res: Response) => {
    const status = await diskManager.getStatus();
    res.status(200).send(status);
  },
));

app.get('*', withAsyncErrorHandler(
  async (req: Request, res: Response) => {
    const path = decodeURI(req.path);

    try {
      const uri = await diskManager.getFileLink(path);
      request(uri).pipe(res);
    } catch (e1) {
      const { authorization } = req.headers;
      if (!authorization || !authorization.startsWith('Bearer')) {
        throw new HttpErrors.Unauthorized('Access deny.');
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
  },
));

app.put('/upload-target/:target', withAsyncErrorHandler(
  async (req: Request, res: Response) => {
    let jwt;
    try {
      jwt = <UploadTarget>JWT.verify(req.params.target, String(JWT_SECRET));
    } catch (e) {
      throw new HttpErrors.Gone('Gone.');
    }

    const has = await uploadTargetManager.has(jwt);
    if (has) {
      throw new HttpErrors.Gone('Gone.');
    }

    const { 'content-type': contentType } = req.headers;
    if (!contentType) {
      throw new HttpErrors.BadRequest('No `Content-Type` header provided.');
    }
    const extension = contentTypeToExtension(contentType);

    let path;
    try {
      path = await diskManager.uploadFile(req, { extension });
    } catch (e) {
      throw new HttpErrors.Conflict('Resource already exists.');
    }

    await uploadTargetManager.add(jwt);

    res.status(201).send(path);
  },
));

app.use(asyncErrorHandler);

app.listen(Number(PORT));
