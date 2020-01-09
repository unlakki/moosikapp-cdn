export default class HTTPError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'HTTPError';
    this.statusCode = statusCode;
  }
}
