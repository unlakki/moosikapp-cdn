export class InvalidExtensionError extends Error {
  readonly name: string;

  constructor(message: string) {
    super(message);

    this.name = 'ExtensionError';
  }
}

export default (contentType: string): string => {
  const type = contentType.slice(contentType.indexOf('/') + 1);

  switch (type) {
    case 'mpeg':
      return 'mp3';
    case 'jpeg':
      return 'jpg';
    case 'mp4':
    case 'webm':
    case 'png':
    case 'webp':
      return type;
    default:
      throw new InvalidExtensionError('Invalid extension.');
  }
};
