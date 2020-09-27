import Stream from 'stream';

class BufferUtils {
  public static fromStream = async (stream: Stream) =>
    new Promise<Buffer>((resolve, reject) => {
      const chunks: Uint8Array[] = [];

      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on('error', (err) => {
        reject(err);
      });
    });
}

export default BufferUtils;
