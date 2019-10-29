export default function getExtension(contentType: string): string {
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
      throw new Error('E_INCORRENT_CONTENT_TYPE');
  }
}
