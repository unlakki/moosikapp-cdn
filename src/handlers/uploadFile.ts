import { Stream } from 'stream';
import { Request, Response } from 'express';
import { DiskManager } from 'yadisk-mgr';
import JWT from 'jsonwebtoken';
import FileType from 'file-type';
import HttpErrors from 'http-errors';
import UploadTargetManager, { UploadTarget } from '../utils/UploadTargetManager';
import { createGoneError, createConflictError } from '../utils/errors';

const { JWT_SECRET } = process.env;

const streamToBuffer = (stream: Stream): Promise<Buffer> => (
  new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on('error', (error) => {
      reject(error);
    });
  })
);

const uploadTargetManager = new UploadTargetManager();

export default (diskManager: DiskManager) => async (req: Request, res: Response) => {
  let jwt;
  try {
    jwt = <UploadTarget>JWT.verify(req.params.target, String(JWT_SECRET));
  } catch (e) {
    throw createGoneError(req.path);
  }

  const has = await uploadTargetManager.has(jwt);
  if (has) {
    throw createGoneError(req.path);
  }

  const { 'content-type': contentType } = req.headers;
  if (!contentType) {
    throw new HttpErrors.BadRequest('No `Content-Type` header provided.');
  }

  const stream = await FileType.stream(req);

  if (stream?.fileType?.mime !== contentType) {
    throw new HttpErrors.BadRequest('Incorrect file type.');
  }

  let path;
  try {
    path = await diskManager.uploadFile(
      await streamToBuffer(stream),
      {
        extension: stream?.fileType?.ext,
      },
    );
  } catch (e) {
    throw createConflictError(req.path);
  }

  await uploadTargetManager.add(jwt);

  res.status(201).header('Location', path).send();
};
