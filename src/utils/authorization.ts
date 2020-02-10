import JWT from 'jsonwebtoken';
import HTTPError from '../errors/HTTPError';

const { JWT_SECRET } = process.env;

interface IAccessToken {
  role: number;
}

export default (accessToken: string): boolean => {
  try {
    const jwt = <IAccessToken>JWT.verify(accessToken, String(JWT_SECRET));
    if (jwt.role < 1024) {
      throw new Error();
    }

    return true;
  } catch (e) {
    throw new HTTPError(401, 'Access denied.');
  }
};
