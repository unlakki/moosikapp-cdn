import { Request, Response } from 'express';
import FileType from 'file-type';
import HttpErrors from 'http-errors';
import request from 'request';
import { DiskManager } from 'yadisk-mgr';
import ConfigProvider from '../core/services/ConfigProvider';
import ITargetManager from '../core/services/interfaces/ITargetManager';
import BufferUtils from '../core/utils/BufferUtils';
import TokenParser from '../core/utils/TokenParser';

class FileController {
  private readonly _diskManager: DiskManager;

  private readonly _tokenParser: TokenParser;

  private readonly _targetManager: ITargetManager;

  constructor(
    diskManager: DiskManager,
    targetManager: ITargetManager,
    configProvider: ConfigProvider,
  ) {
    this._diskManager = diskManager;
    this._targetManager = targetManager;
    this._tokenParser = new TokenParser(configProvider);
  }

  public get = async (req: Request, res: Response) => {
    const path = decodeURI(req.path);

    try {
      const fileLink = await this._diskManager.getFileLink(path);
      request(fileLink).pipe(res);
    } catch {
      throw new HttpErrors.NotFound();
    }
  };

  public upload = async (req: Request, res: Response) => {
    const token = this._tokenParser.tryParseToken(req.params.target);
    if (!token) {
      throw new HttpErrors.BadRequest();
    }

    if (await this._targetManager.has(token)) {
      throw new HttpErrors.Gone();
    }

    await this._targetManager.add(token);

    const streamWithFileType = await FileType.stream(req);
    if (streamWithFileType.fileType?.mime !== req.headers['content-type']) {
      throw new HttpErrors.BadRequest();
    }

    const buffer = await BufferUtils.fromStream(streamWithFileType);

    const path = await this._diskManager.uploadFile(buffer, {
      ext: streamWithFileType.fileType?.ext,
    });
    res.status(201).header('Location', path).send();
  };
}

export default FileController;
