import { Buffer } from 'buffer';
import { DiskManager } from 'yadisk-mgr';
import Express from 'express';
import cors from 'cors';
import request from 'request-promise';

const {
  PORT, VERIFICATION_SERVER, TOKENS,
} = process.env;

const mgr = new DiskManager(JSON.parse(TOKENS));

const app = Express();

app.disable('x-powered-by');
app.disable('etag');

app.use(cors());

app.use((err, req, res, next) => {
  if (!err) {
    next();
  }

  res.status(500).send();
});

app.get('/v1/*', async (req, res) => {
  const { path } = req;

  try {
    const uri = await mgr.getFileLink(path.slice(3));

    request(uri).pipe(res);
  } catch (e) {
    res.status(404).send();
  }
});

app.put('/v1/upload-target/:target', async (req, res) => {
  const { target } = req.params;
  const [uuid, dext] = target.split('_');

  try {
    await request(`${VERIFICATION_SERVER}?uuid=${uuid}`);

    const ext = Buffer.from(dext, 'hex').toString('utf8');
    const { path } = await mgr.uploadFile(req, ext);

    res.status(201).send(path);
  } catch (e) {
    switch (e.statusCode) {
      case 404:
        res.status(410).send();
        break;
      default:
        res.status(400).send();
    }
  }
});

app.all('*', (req, res) => {
  res.status(403).send();
});

app.listen(PORT || 8080);
