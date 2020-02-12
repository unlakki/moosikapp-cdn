import MimeTypes from 'mime-types';
import HttpErrors from 'http-errors';

export default (contentType: string) => {
  const extension = MimeTypes.extension(contentType);
  if (!extension) {
    throw new HttpErrors.UnsupportedMediaType('Incorrect `Content-Type` header provided.');
  }

  return extension;
};
