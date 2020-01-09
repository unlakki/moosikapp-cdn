export interface JWTToken {
  hex: string;
  iat: number;
  exp: number;
}

interface TokenManagerOptions {
  period: number;
}

export default class {
  private period: number;

  private tokenList = new Map<string, number>();

  private timer: NodeJS.Timeout;

  constructor(options: TokenManagerOptions) {
    this.period = options.period;
    this.start();
  }

  public start() {
    this.timer = setInterval(this.check, this.period);
  }

  public stop() {
    clearInterval(this.timer);
  }

  public add(token: JWTToken) {
    this.tokenList.set(token.hex, token.exp);
  }

  public has(token: JWTToken) {
    return this.tokenList.has(token.hex);
  }

  private check() {
    if (!this.tokenList) {
      this.tokenList = new Map<string, number>();
    }

    this.tokenList = Object.entries(this.tokenList).reduce((list, token) => {
      const now = Date.now();

      if (now < token[1] * 1000) {
        list.set(token[0], token[1]);
      }

      return list;
    }, new Map<string, number>());
  }
}
