import Path from 'path';
import Express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import DiskManager from 'yadisk-mgr';
import asyncErrorHandler, { withAsyncErrorHandler } from './middlewares/asyncErrorHandler';
import getStatus from './endpoints/getStatus';
import get from './endpoints/get';
import upload from './endpoints/upload';

const { PORT, TOKEN_LIST } = process.env;

const tokenList = JSON.parse(String(TOKEN_LIST));
const diskManager = new DiskManager(tokenList);

const app = Express();

app.use(helmet({ hsts: false }));
app.use(cors());

app.set('view engine', 'pug');
app.set('views', Path.resolve('src/views'));

app.get('/status.json', withAsyncErrorHandler(getStatus(diskManager)));

app.get('*', withAsyncErrorHandler(get(diskManager)));

app.put('/upload-target/:target', withAsyncErrorHandler(upload(diskManager)));

app.use(asyncErrorHandler);

app.listen(Number(PORT));
