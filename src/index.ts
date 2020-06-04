import Express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from './routes';
import asyncErrorHandler from './middlewares/asyncErrorHandler';

const app = Express();

app.use(helmet({ hsts: false }));
app.use(cors());

app.use(router());

app.use(asyncErrorHandler);

app.listen(Number(process.env.PORT));
