import cors from 'cors';
import Express from 'express';
import helmet from 'helmet';
import ConfigProvider from './core/services/ConfigProvider';
import asyncErrorHandler from './middlewares/asyncErrorHandler';
import getRouter from './router';

const app = Express();
const configProvider = new ConfigProvider();

app.use(helmet({ hsts: false }));
app.use(cors());

app.use(getRouter(configProvider));
app.use(asyncErrorHandler);

app.listen(configProvider.port);
