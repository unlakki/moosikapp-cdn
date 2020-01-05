import DiskManager from 'yadisk-mgr';
import Express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import JWT, { JsonWebTokenError } from 'jsonwebtoken';
import request from 'request-promise';
import parseExtension, { ExtensionParseError } from './utils/ExtensionParser';
import HTTPError from './errors/HTTPError';
import TokenManager, { JWTToken } from './utils/TokenManager';

const { PORT, TOKEN_LIST, JWT_SECRET } = process.env;

const tokenList = JSON.parse(String(TOKEN_LIST));
const diskManager = new DiskManager(tokenList);

const tokenManager = new TokenManager({ period: 60000 });

const app = Express();

app.use(helmet({ hsts: false }));
app.use(cors());

app.get('*', async (req: Request, res: Response) => {
  try {
    const uri = await diskManager.getFileLink(req.path);

    request(uri).pipe(res);
  } catch (e) {
    res.status(404).send('Not Found.');
  }
});

app.put('/upload-target/:target', async (req: Request, res: Response) => {
  const { 'content-type': contentType } = req.headers;

  try {
    if (!contentType) {
      throw new HTTPError(400, 'No `Content-Type` header provided.');
    }

    const token = JWT.verify(req.params.target, String(JWT_SECRET)) as JWTToken;

    if (tokenManager.has(token)) {
      throw new HTTPError(410, 'Gone.');
    }

    tokenManager.add(token);

    const extension = parseExtension(contentType);
    const { path } = await diskManager.uploadFile(req, extension);

    res.status(201).send(path);
  } catch (e) {
    if (e instanceof JsonWebTokenError) {
      res.status(410).send('Gone.');
      return;
    }

    if (e instanceof ExtensionParseError) {
      res.status(415).send('Incorrect `Content-Type` header provided.');
      return;
    }

    if (e instanceof HTTPError) {
      res.status(e.statusCode).send(e.message);
      return;
    }

    res.status(500).send('Internal server error.');
  }
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (!error) {
    next();
  }

  res.status(500).send('Internal server error.');
});

app.listen(Number(PORT));
