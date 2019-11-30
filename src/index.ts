import DiskManager from 'yadisk-mgr';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import request from 'request-promise';
import getExtension from './utils/getExtension';

const VERSION = 1;

const {
  PORT, VERIFICATION_SERVER, TOKEN_LIST,
} = process.env;

if (!TOKEN_LIST) {
  console.error('No token list provided.');
  process.exit();
}

const diskManager = new DiskManager(JSON.parse(String(TOKEN_LIST)));

const app = express();

app.use(helmet({ hsts: false }));
app.use(cors());

app.get(`/v${VERSION}/*`, async (req: Request, res: Response) => {
  const { path } = req;

  try {
    const uri = await diskManager.getFileLink(path.slice(path.indexOf('/', 1)));

    request(uri).pipe(res);
  } catch (e) {
    res.status(404).send();
  }
});

app.put(`/v${VERSION}/upload-target/:uuid`, async (req, res) => {
  const {
    params: {
      uuid,
    },
    headers,
  } = req;

  try {
    await request(`${VERIFICATION_SERVER}?uuid=${uuid}`);

    const contentType = headers['content-type'];
    if (!contentType) {
      throw new Error('No `Content-Type` header provided.');
    }

    const extension = getExtension(contentType);
    const { path } = await diskManager.uploadFile(req, extension);

    res.status(201).send(path);
  } catch (e) {
    if (e.statusCode) {
      res.status(410).send();
      return;
    }

    switch (e.message) {
      case 'E_INCORRENT_CONTENT_TYPE':
        res.status(415).send('Incorrect `Content-Type` header provided.');
        break;
      default:
        res.status(400).send(e.message);
    }

    res.status(400).send(e.message);
  }
});

app.all('*', (req, res) => {
  res.status(403).send();
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (!error) {
    next();
  }

  res.status(500).send();
});

app.listen(PORT);
