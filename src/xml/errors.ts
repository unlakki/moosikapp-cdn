import XmlHttpError from './XmlHttpError';

const BadRequest = (details: string) => new XmlHttpError(400, details);

const Forbitten = (path: string) => new XmlHttpError(
  403,
  `Anonymous caller does not have storage.objects.${
    path === '/' ? 'list' : 'get'
  } access to cdn.moosikapp${
    path.length > 1 ? path : ''
  }.`,
);

const NotFound = (path: string) => new XmlHttpError(404, `Server can't find ${path} object.`);

const Conflict = (path: string) => new XmlHttpError(
  409,
  `Request ${path} conflict with current state of the server.`,
);

const Gone = (path: string) => new XmlHttpError(
  410,
  `Resource ${path} is no longer available.`,
);

const InternalServerError = () => new XmlHttpError(
  500,
  'Server encountered an unexpected condition that prevented it from fulfilling the request.',
);

export default {
  BadRequest,
  Forbitten,
  NotFound,
  Conflict,
  Gone,
  InternalServerError,
};
