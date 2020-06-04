import { Response } from 'express';
import { DiskManager } from 'yadisk-mgr';
import JWT from 'jsonwebtoken';
import HttpErrors from 'http-errors';
import { jwtSecretKey } from '../../config';
import { RequestWithPayload } from '../../middlewares/fileParser';
import createTargetManager, { Target } from '../../utils/targetManager';

const targetManager = createTargetManager();

const parseJWT = (target: string) => {
  try {
    return <Target>JWT.verify(target, jwtSecretKey);
  } catch {
    throw new HttpErrors.Gone();
  }
};

export default (diskManager: DiskManager) => (
  async (req: RequestWithPayload, res: Response) => {
    const target = parseJWT(req.params.target);

    const has = await targetManager.has(target);
    if (has) {
      throw new HttpErrors.Gone();
    }

    await targetManager.add(target);

    try {
      const path = await diskManager.uploadFile(req.file.buffer, { ext: req.file.ext });
      res.status(201).header('Location', path).send();
    } catch (e) {
      throw new HttpErrors.Conflict();
    }
  }
);
