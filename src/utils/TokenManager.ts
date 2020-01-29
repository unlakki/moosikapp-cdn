import redis, { RedisClient } from 'redis';

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

export interface JWTToken {
  hex: string;
  iat: number;
  exp: number;
}

export default class TokenManager {
  private client: RedisClient;

  constructor() {
    this.client = redis.createClient({
      host: REDIS_HOST,
      port: Number(REDIS_PORT),
      password: REDIS_PASSWORD,
    });
  }

  public async add(token: JWTToken): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.set(token.hex, '', (e1, r1) => {
        if (e1) {
          reject(e1);
          return;
        }

        this.client.expire(token.hex, token.exp - Math.ceil(Date.now() / 1000), (e2, r2) => {
          if (e2) {
            reject(e2);
            return;
          }

          resolve(r1 === 'OK' && r2 === 1);
        });
      });
    });
  }

  public async has(token: JWTToken): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.exists(token.hex, (e, r) => {
        if (e) {
          reject(e);
          return;
        }

        resolve(r === 1);
      });
    });
  }
}
