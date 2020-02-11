import { Request } from 'express';
import JWT from 'jsonwebtoken';
import HTTPError from '../errors/HTTPError';

const { JWT_SECRET } = process.env;

interface IAccessToken {
  role: number;
}

export default (req: Request): boolean => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer')) {
    throw new HTTPError(401, 'Access denied.');
  }

  const accessToken = authorization.slice(7);

  let jwt;
  try {
    jwt = <IAccessToken>JWT.verify(accessToken, String(JWT_SECRET));
  } catch (e) {
    throw new HTTPError(401, 'Access denied.');
  }

  if (jwt.role < 1024) {
    throw new HTTPError(401, 'Access denied.');
  }

  return true;
};
