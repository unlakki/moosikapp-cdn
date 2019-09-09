import { Buffer } from 'buffer';
import DiskManager from 'yadisk-mgr';
import Express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import request from 'request-promise';

const {
  PORT, VERIFICATION_SERVER, TOKENS,
} = process.env;

if (!TOKENS) {
  console.warn('No tokens found.');
  process.exit(1);
}

const diskManager = new DiskManager(JSON.parse(TOKENS as string));

const app = Express();

app.disable('x-powered-by');
app.disable('etag');

app.use(cors());

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    next();
  }

  res.status(500).send();
});

app.get('/v1/*', async (req: Request, res: Response) => {
  const { path } = req;

  try {
    const uri = await diskManager.getFileLink(path.slice(3));

    request(uri).pipe(res);
  } catch (e) {
    res.status(404).send();
  }
});

app.put('/v1/upload-target/:target', async (req, res) => {
  const { target } = req.params;
  const [uuid, dext] = target.split('.');

  try {
    await request(`${VERIFICATION_SERVER}?uuid=${uuid}`);

    const ext = Buffer.from(dext, 'hex').toString('utf8');
    const { path } = await diskManager.uploadFile(req, ext);

    res.status(201).send(path);
  } catch (e) {
    switch (e.statusCode) {
      case 400:
        res.status(410).send();
        break;
      default:
        res.status(400).send(e.message);
    }
  }
});

app.all('*', (req, res) => {
  res.status(403).send();
});

app.listen(PORT);
