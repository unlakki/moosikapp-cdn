import JWT from 'jsonwebtoken';
import HttpErrors from 'http-errors';

const { JWT_SECRET } = process.env;

interface AccessToken {
  role: number;
}

export default (accessToken: string): boolean => {
  let jwt;
  try {
    jwt = <AccessToken>JWT.verify(accessToken, String(JWT_SECRET));
  } catch (e) {
    throw new HttpErrors.Forbidden('Access denied.');
  }

  if (jwt.role < 1024) {
    throw new HttpErrors.Forbidden('Access denied.');
  }

  return true;
};
