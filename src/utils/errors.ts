import HttpErrors from 'http-errors';
import tempalte from './template';

import {
  FORBITTEN_ERROR,
  NOT_FOUND_ERROR,
  CONFLICT_ERROR,
  GONE_ERROR,
} from '../constants/errors.json';

export const createForbittenError = (path: string) => (
  new HttpErrors.Forbidden(tempalte(FORBITTEN_ERROR, {
    type: path === '/' ? 'list' : 'get',
    path: path.length > 1 ? decodeURI(path) : '',
  }))
);

export const createNotFoundError = (path: string) => (
  new HttpErrors.NotFound(tempalte(NOT_FOUND_ERROR, { path }))
);

export const createConflictError = (path: string) => (
  new HttpErrors.Conflict(tempalte(CONFLICT_ERROR, { path }))
);

export const createGoneError = (path: string) => (
  new HttpErrors.Gone(tempalte(GONE_ERROR, { path }))
);
