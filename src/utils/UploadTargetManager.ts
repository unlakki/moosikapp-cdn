import redis, { RedisClient } from 'redis';

const { REDIS_URI, REDIS_SECRET } = process.env;

export interface UploadTarget {
  uid: string;
  iat: number;
  exp: number;
}

export default class UploadTargetManager {
  private client: RedisClient;

  constructor() {
    const [host, port] = String(REDIS_URI).split(':');

    this.client = redis.createClient({
      host,
      port: Number(port),
      password: REDIS_SECRET,
    });
  }

  public async add(uploadTaget: UploadTarget): Promise<boolean> {
    const { uid, exp } = uploadTaget;

    return new Promise((resolve, reject) => {
      this.client.set(uid, '', (error1, result1) => {
        if (error1) {
          reject(error1);
          return;
        }

        this.client.expire(uid, exp - Math.ceil(Date.now() / 1000), (error2, result2) => {
          if (error2) {
            reject(error2);
            return;
          }

          resolve(result1 === 'OK' && result2 === 1);
        });
      });
    });
  }

  public async has(uploadTaget: UploadTarget): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.exists(uploadTaget.uid, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result === 1);
      });
    });
  }
}
