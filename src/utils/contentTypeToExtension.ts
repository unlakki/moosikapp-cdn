import MimeTypes from 'mime-types';
import HTTPError from '../errors/HTTPError';

export default (contentType: string) => {
  const extension = MimeTypes.extension(contentType);
  if (!extension) {
    throw new HTTPError(415, 'Incorrect `Content-Type` header provided.');
  }

  return extension;
};
