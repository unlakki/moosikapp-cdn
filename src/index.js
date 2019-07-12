import FS from 'fs';
import Path from 'path';
import { Buffer } from 'buffer';
import { DiskManager } from 'yadisk-mgr';
import Express from 'express';
import request from 'request-promise';
import { exists, unlink, createCache } from './utils';

const {
  PORT, VERIFICATION_SERVER, TOKENS, CACHED_FILE_MAX_TTL,
} = process.env;

createCache();

const mgr = new DiskManager(JSON.parse(TOKENS));

const app = Express();

app.disable('x-powered-by');
app.disable('etag');

app.get('/v1/*', async (req, res) => {
  const { path } = req;

  const cachePath = Path.resolve('./cache', path.slice(4).replace('/', '-'));

  const isExists = await exists(cachePath);
  if (isExists) {
    FS.createReadStream(cachePath, { autoClose: true }).pipe(res);
    return;
  }

  try {
    const uri = await mgr.getFileLink(path.slice(3));

    const fileData = request(uri);

    fileData.pipe(FS.createWriteStream(cachePath));
    fileData.pipe(res);

    fileData.on('complete', () => {
      setTimeout(async () => {
        try {
          await unlink(cachePath);
        } catch (e) {
          console.error(e.message);
        }
      }, CACHED_FILE_MAX_TTL);
    });
  } catch (e) {
    res.status(404).send();
  }
});

app.put('/v1/upload/:token', async (req, res) => {
  const { token } = req.params;
  const [uuid, dext] = token.split('_');

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
