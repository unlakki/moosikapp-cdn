import { Router } from 'express';
import Redis from 'redis';
import createDiskManager from 'yadisk-mgr';
import FileController from './controllers/FileController';
import StatusController from './controllers/StatusController';
import ConfigProvider from './core/services/ConfigProvider';
import TargetManager from './core/services/TargetManager';
import { withAsyncErrorHandler } from './middlewares/asyncErrorHandler';

const getRouter = (configProvider: ConfigProvider) => {
  const diskManager = createDiskManager(...configProvider.diskTokenList);

  const statusController = new StatusController(diskManager);

  const redis = Redis.createClient(configProvider.redisUri);
  const targetManager = new TargetManager(redis);
  const fileController = new FileController(diskManager, targetManager, configProvider);

  const router = Router();

  router.get('/status.json', withAsyncErrorHandler(statusController.get));
  router.get('*', withAsyncErrorHandler(fileController.get));
  router.put('/upload-target/:target', withAsyncErrorHandler(fileController.upload));

  return router;
};

export default getRouter;
