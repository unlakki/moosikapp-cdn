import { Router } from 'express';
import createDiskManager from 'yadisk-mgr';
import status from './get/status';
import getFile from './get/file';
import getDirList from './get/list';
import putFile from './put/file';
import checkAuth from '../middlewares/authorization';
import checkPermissions from '../middlewares/permissions';
import fileParser from '../middlewares/fileParser';
import { withAsyncErrorHandler } from '../middlewares/asyncErrorHandler';
import { diskTokenArray } from '../config';

const diskManager = createDiskManager(diskTokenArray);

export default () => {
  const router = Router();

  router.get('/status.json', withAsyncErrorHandler(
    status(diskManager),
  ));

  router.get('*', withAsyncErrorHandler(
    getFile(diskManager),
    checkAuth(),
    checkPermissions(1024),
    getDirList(diskManager),
  ));

  router.put('/upload-target/:target', withAsyncErrorHandler(
    fileParser(),
    putFile(diskManager),
  ));

  return router;
};
