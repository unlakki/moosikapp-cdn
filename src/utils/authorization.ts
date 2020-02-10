import JWT from 'jsonwebtoken';
import HTTPError from '../errors/HTTPError';

const { JWT_SECRET } = process.env;

interface AccessToken {
  role: number;
}

export default (accessToken: string): boolean => {
  const jwt = <AccessToken>JWT.verify(accessToken, String(JWT_SECRET));
  if (jwt.role < 1024) {
    throw new HTTPError(401, 'Access denied');
  }

  return true;
};
