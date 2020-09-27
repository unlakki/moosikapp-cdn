import { Request, Response } from 'express';
import { DiskManager } from 'yadisk-mgr';

class StatusController {
  private _diskManager: DiskManager;

  constructor(diskManager: DiskManager) {
    this._diskManager = diskManager;
  }

  public get = async (req: Request, res: Response) => {
    const status = await this._diskManager.getStatus();
    res.status(200).send(status);
  };
}

export default StatusController;
