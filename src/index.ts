import Path from 'path';
import Express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import DiskManager from 'yadisk-mgr';
import checkAuth from './middlewares/authorization';
import checkPermissions from './middlewares/permissions';
import getStatus from './handlers/getStatus';
import getFile from './handlers/getFile';
import getDirList from './handlers/getDirList';
import uploadFile from './handlers/uploadFile';
import asyncErrorHandler, { withAsyncErrorHandler } from './middlewares/asyncErrorHandler';

const { PORT, TOKEN_LIST } = process.env;

const tokenList = JSON.parse(String(TOKEN_LIST));
const diskManager = new DiskManager(tokenList);

const app = Express();

app.use(helmet({ hsts: false }));
app.use(cors());

app.set('view engine', 'pug');
app.set('views', Path.resolve('src/views'));

app.get('/status.json', withAsyncErrorHandler(getStatus(diskManager)));

app.get('*', withAsyncErrorHandler(
  getFile(diskManager),
  checkAuth(),
  checkPermissions(1024),
  getDirList(diskManager),
));

app.put('/upload-target/:target', withAsyncErrorHandler(uploadFile(diskManager)));

app.use(asyncErrorHandler);

app.listen(Number(PORT));
