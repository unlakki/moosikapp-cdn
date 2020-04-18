import { Request, Response } from 'express';
import DiskManager from 'yadisk-mgr';
import HttpErrors from 'http-errors';
import JWT from 'jsonwebtoken';
import FileType from 'file-type';
import UploadTargetManager, { UploadTarget } from '../managers/UploadTargetManager';

const { JWT_SECRET } = process.env;

const uploadTargetManager = new UploadTargetManager();

export default (diskManager: DiskManager) => async (req: Request, res: Response) => {
  let jwt;
  try {
    jwt = <UploadTarget>JWT.verify(req.params.target, String(JWT_SECRET));
  } catch (e) {
    throw new HttpErrors.Gone('Gone.');
  }

  const has = await uploadTargetManager.has(jwt);
  if (has) {
    throw new HttpErrors.Gone('Gone.');
  }

  const { 'content-type': contentType } = req.headers;
  if (!contentType) {
    throw new HttpErrors.BadRequest('No `Content-Type` header provided.');
  }

  const stream = await FileType.stream(req);

  if (stream.fileType?.mime !== contentType) {
    throw new HttpErrors.BadRequest('Bad request.');
  }

  let path;
  try {
    path = await diskManager.uploadFile(stream, { extension: stream.fileType?.ext });
  } catch (e) {
    throw new HttpErrors.Conflict('Resource already exists.');
  }

  await uploadTargetManager.add(jwt);

  res.status(201).send(path);
};
