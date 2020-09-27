import { RedisClient } from 'redis';
import Token from '../models/Token';
import ITargetManager from './interfaces/ITargetManager';

class TargetManager implements ITargetManager {
  private _redis: RedisClient;

  constructor(redis: RedisClient) {
    this._redis = redis;
  }

  public add = (token: Token) =>
    new Promise<boolean>((resolve, reject) => {
      this._redis.set(token.jti, '', 'EX', token.exp - Math.ceil(Date.now() / 1000), (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(true);
      });
    });

  public has = (token: Token) =>
    new Promise<boolean>((resolve, reject) => {
      this._redis.exists(token.jti, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result === 1);
      });
    });
}

export default TargetManager;
