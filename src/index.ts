import Path from 'path';
import Express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import JWT, { JsonWebTokenError } from 'jsonwebtoken';
import request from 'request-promise';
import DiskManager from 'yadisk-mgr';
import filesize from 'filesize';
import UploadTargetManager, { IUploadTarget } from './utils/UploadTargetManager';
import checkAuth from './utils/authorization';
import getExtensionFromContentType from './utils/getExtensionFromContentType';
import errorHandler from './utils/errorHandler';
import HTTPError from './errors/HTTPError';

const { PORT, TOKEN_LIST, JWT_SECRET } = process.env;

const tokenList = JSON.parse(String(TOKEN_LIST));
const diskManager = new DiskManager(tokenList);

const uploadTargetManager = new UploadTargetManager();

const app = Express();

app.use(helmet({ hsts: false }));
app.use(cors());

app.set('view engine', 'pug');
app.set('views', Path.resolve('src/views'));

app.get('/status.json', async (req, res) => {
  try {
    const status = await diskManager.getStatus();
    res.status(200).send(status);
  } catch (e) {
    res.status(500).send('Internal server error.');
  }
});

app.get('*', async (req: Request, res: Response) => {
  const path = decodeURI(req.path);

  try {
    const uri = await diskManager.getFileLink(path);
    request(uri).pipe(res);
  } catch (e1) {
    try {
      const { authorization } = req.headers;
      if (!authorization || !authorization.startsWith('Bearer')) {
        throw new HTTPError(401, 'Access denied.');
      }

      const accessToken = authorization.slice(7);
      checkAuth(accessToken);

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
      if (e2 instanceof HTTPError) {
        res.status(e2.statusCode).send(e2.message);
        return;
      }

      res.status(404).send('Not found.');
    }
  }
});

app.put('/upload-target/:target', async (req: Request, res: Response) => {
  try {
    const jwt = <IUploadTarget>JWT.verify(req.params.target, String(JWT_SECRET));

    if (uploadTargetManager.has(jwt)) {
      throw new HTTPError(410, 'Gone.');
    }

    const { 'content-type': contentType } = req.headers;
    if (!contentType) {
      throw new HTTPError(400, 'No `Content-Type` header provided.');
    }
    const extension = getExtensionFromContentType(contentType);

    uploadTargetManager.add(jwt);

    const path = await diskManager.uploadFile(req, { extension });
    res.status(201).send(path);
  } catch (e) {
    if (e instanceof JsonWebTokenError) {
      res.status(410).send('Gone.');
      return;
    }

    if (e instanceof HTTPError) {
      res.status(e.statusCode).send(e.message);
      return;
    }

    res.status(500).send('Internal server error.');
  }
});

app.use(errorHandler);

app.listen(Number(PORT));
