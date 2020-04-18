import xml from 'xml';
import HttpErrors from 'http-errors';

const getXmlContent = (statusCode: number, details: string) => {
  const { name, message } = new HttpErrors[statusCode]();
  return xml({ Error: [{ Name: name }, { Message: `${message}.` }, { Details: details }] });
};

export default class XmlHttpError extends Error {
  public readonly status: number;

  constructor(status: number, details: string) {
    super(getXmlContent(status, details));
    this.status = status;
  }
}
