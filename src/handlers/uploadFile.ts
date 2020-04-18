import { Request, Response } from 'express';
import DiskManager from 'yadisk-mgr';
import JWT from 'jsonwebtoken';
import FileType from 'file-type';
import UploadTargetManager, { UploadTarget } from '../utils/UploadTargetManager';
import XmlError from '../xml/errors';

const { JWT_SECRET } = process.env;

const uploadTargetManager = new UploadTargetManager();

export default (diskManager: DiskManager) => async (req: Request, res: Response) => {
  let jwt;
  try {
    jwt = <UploadTarget>JWT.verify(req.params.target, String(JWT_SECRET));
  } catch (e) {
    throw XmlError.Gone(req.path);
  }

  const has = await uploadTargetManager.has(jwt);
  if (has) {
    throw XmlError.Gone(req.path);
  }

  const { 'content-type': contentType } = req.headers;
  if (!contentType) {
    throw XmlError.BadRequest('No `Content-Type` header provided.');
  }

  const stream = await FileType.stream(req);

  if (stream.fileType?.mime !== contentType) {
    throw XmlError.BadRequest('Incorrect file type.');
  }

  let path;
  try {
    path = await diskManager.uploadFile(stream, { extension: stream.fileType?.ext });
  } catch (e) {
    throw XmlError.Conflict(req.path);
  }

  await uploadTargetManager.add(jwt);

  res.status(201).send(path);
};
