import DiskManager from 'yadisk-mgr';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import JWT, { JsonWebTokenError } from 'jsonwebtoken';
import request from 'request-promise';
import getExtension, { InvalidExtensionError } from './utils/extensions';

const {
  PORT, TOKEN_LIST, JWT_SECRET,
} = process.env;

const diskManager = new DiskManager(JSON.parse(String(TOKEN_LIST)));

const app = express();

app.use(helmet({ hsts: false }));
app.use(cors());

app.get('*', async (req: Request, res: Response) => {
  try {
    const uri = await diskManager.getFileLink(req.path);

    request(uri).pipe(res);
  } catch (e) {
    res.status(404).send();
  }
});

app.put('/upload-target/:target', async (req, res) => {
  const { 'content-type': contentType } = req.headers;

  try {
    if (!contentType) {
      throw new Error('No `Content-Type` header provided.');
    }

    JWT.verify(req.params.target, String(JWT_SECRET));

    const extension = getExtension(contentType);
    const { path } = await diskManager.uploadFile(req, extension);

    res.status(201).send(path);
  } catch (e) {
    if (e instanceof JsonWebTokenError) {
      res.status(410).send();
      return;
    }

    if (e instanceof InvalidExtensionError) {
      res.status(415).send('Incorrect `Content-Type` header provided.');
      return;
    }

    res.status(400).send(e.message);
  }
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (!error) {
    next();
  }

  res.status(500).send();
});

app.listen(Number(PORT));
