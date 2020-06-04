import { promisify } from 'util';
import Redis from 'redis';

interface Set {
  (key: string, value: string): Promise<'OK'>
}

interface Expire {
  (key: string, seconds: number): Promise<1>;
}

interface Exists {
  (key: string): Promise<number>;
}

export interface Target {
  uid: string;
  iat: number;
  exp: number;
}

export interface TargetManager {
  add: (uploadTarget: Target) => Promise<boolean>;
  has: (uploadTarget: Target) => Promise<boolean>;
}

const createUploadTargetManager = (): TargetManager => {
  const uri = process.env.REDIS_URI;
  if (!uri) {
    throw new Error('No redis uri.');
  }

  const redis = Redis.createClient(uri);

  const promisifyRedisMethod = <T = Function>(fn: Function): T => (
    promisify(fn).bind(redis)
  );

  const set = promisifyRedisMethod<Set>(redis.set);
  const expire = promisifyRedisMethod<Expire>(redis.expire);
  const exists = promisifyRedisMethod<Exists>(redis.exists);

  return {
    add: async ({ uid, exp }) => {
      await set(uid, '');
      await expire(uid, exp - Math.ceil(Date.now() / 1000));

      return true;
    },
    has: async ({ uid }) => {
      const r = await exists(uid);

      return r === 1;
    },
  };
};

export default createUploadTargetManager;
