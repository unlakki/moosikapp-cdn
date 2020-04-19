import { HttpError } from 'http-errors';
import xml from 'xml';

class XmlBuilder {
  public static createErrorMessage = (error: HttpError) => {
    const { name, message: details } = error;

    const message = XmlBuilder.genMessageFromErrorName(name);
    return xml({ Error: [{ Name: name }, { Message: message }, { Details: details }] });
  };

  private static genMessageFromErrorName = (str: string) => (
    `${str
      .replace(/(?<!internalserver)error$/i, '')
      .replace(/[A-Z]/g, (char: string, index: number) => (
        index === 0 ? char : ` ${char.toLowerCase()}`
      ))
    }.`
  );
}

export default XmlBuilder;
