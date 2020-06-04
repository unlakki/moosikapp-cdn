import { Stream } from 'stream';

const streamToBuffer = (stream: Stream): Promise<Buffer> => (
  new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];

    stream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on('error', (error) => {
      reject(error);
    });
  })
);

export default streamToBuffer;
