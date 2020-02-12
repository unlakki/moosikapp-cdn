import JWT from 'jsonwebtoken';
import HttpErrors from 'http-errors';

const { JWT_SECRET } = process.env;

interface IAccessToken {
  role: number;
}

export default (authorization: string): boolean => {
  const accessToken = authorization.slice(7);

  let jwt;
  try {
    jwt = <IAccessToken>JWT.verify(accessToken, String(JWT_SECRET));
  } catch (e) {
    throw new HttpErrors.Unauthorized('Access deny.');
  }

  if (jwt.role < 1024) {
    throw new HttpErrors.Unauthorized('Access deny.');
  }

  return true;
};
