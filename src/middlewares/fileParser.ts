/* eslint-disable */
import {
  RequestHandler, Request, Response, NextFunction,
} from 'express';
import FileType from 'file-type';
import HttpErrors from 'http-errors';
import streamToBuffer from '../utils/streamToBuffer';

export interface RequestWithPayload extends Request {
  file: {
    buffer: Buffer;
    ext: string;
    mime: string;
  }
}

const parse = (): RequestHandler => (
  async (req: RequestWithPayload, res: Response, next: NextFunction) => {
    const { 'content-type': contentType } = req.headers;
    if (!contentType) {
      throw new HttpErrors.BadRequest();
    }

    const stream = await FileType.stream(req);
    if (stream.fileType?.mime !== contentType) {
      throw new HttpErrors.BadRequest();
    }

    req.file = {
      ...stream.fileType,
      buffer: await streamToBuffer(stream),
    };

    next();
  }
);

export default parse;
