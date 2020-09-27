class ConfigProvider {
  private _jwtSecretKey: string;

  private _redisUri: string;

  private _diskTokenList: string[];

  private _port = 8080;

  constructor() {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    if (!jwtSecretKey) {
      throw new Error('No jwt secret key');
    }
    this._jwtSecretKey = jwtSecretKey;

    const redisUri = process.env.REDIS_URI;
    if (!redisUri) {
      throw new Error('No redis uri');
    }
    this._redisUri = redisUri;

    const diskTokenIds = Object.keys(process.env).filter((envKey) => /DISK\d+/.test(envKey));
    if (diskTokenIds.length === 0) {
      throw new Error('No disk token');
    }

    this._diskTokenList = diskTokenIds.map((diskTokenId) => <string>process.env[diskTokenId]);

    const port = process.env.PORT;
    if (port) {
      this._port = Number.parseInt(port, 10);
    }
  }

  public get jwtSecretKey() {
    return this._jwtSecretKey;
  }

  public get redisUri() {
    return this._redisUri;
  }

  public get diskTokenList() {
    return this._diskTokenList;
  }

  public get port() {
    return this._port;
  }
}

export default ConfigProvider;
